import { createStore, type StoreApi } from "zustand";
import type { ExtensionRegistration, ExtensionSlotInfo, ExtensionStore, AssignedExtension, ExtensionInternalStore, ExtensionSlotState } from "./types";
import { isEqual } from 'lodash';
import { useEffect, useRef } from "react";
const globalStores = new Map<string, StoreApi<unknown>>();

export function createGlobalStore<T>(name: string, initialState: T): StoreApi<T> {
    const existingStore = globalStores.get(name);
    if (existingStore) {
        console.warn(`Store "${name}" already exists. Returning existing store.`);
        return existingStore as StoreApi<T>;
    }

    const store = createStore<T>(() => initialState);
    globalStores.set(name, store);
    return store;
}

export function getGlobalStore<T>(name: string, initialState: T) {
    if (!globalStores.has(name)) {
        return createGlobalStore(name, initialState) as StoreApi<T>;
    }
    return globalStores.get(name) as StoreApi<T>;
}

export function updateGlobalStore<T>(name: string, updater: (state: T) => T) {
    const store = globalStores.get(name);
    if (!store) {
        console.error(`Store "${name}" does not exist.`);
        return;
    }

    const currentState = store.getState() as T;
    const newState = updater(currentState);
    if (currentState !== newState) {
        store.setState(newState);
    }
}

// ============================================================================
// EXTENSION INTERNAL STORE
// ============================================================================

const extensionInternalStore = createGlobalStore<ExtensionInternalStore>('extensionsInternal', {
    slots: {},
    extensions: {},
});

export const getExtensionInternalStore = () => getGlobalStore<ExtensionInternalStore>('extensionsInternal', {
    slots: {},
    extensions: {}
})

export function updateExtensionInternalStore(
    updater: (state: ExtensionInternalStore) => ExtensionInternalStore
) {
    const existingState = extensionInternalStore.getState();
    const newState = updater(existingState);

    if (existingState !== newState) {
        extensionInternalStore.setState(newState);
    }
}

// ============================================================================
// EXTENSION OUTPUT STORE
// ============================================================================

export const getExtensionStore = () => getGlobalStore<ExtensionStore>('extensions', {
    slots: {}
});

const extensionStore = getExtensionStore();

// ============================================================================
// STORE SYNCHRONIZATION
// ============================================================================

function updateExtensionOutputStore(internalState: ExtensionInternalStore) {
    const slots: Record<string, ExtensionSlotState> = {};

    for (const [slotName, slot] of Object.entries(internalState.slots)) {
        const assignedExtensions = getAssignedExtensionsFromSlotData(slotName, internalState);
        slots[slotName] = {
            assignedExtensions,
            moduleName: slot.moduleName,
            state: slot.state
        }
    }

    
    const oldSlots = extensionStore?.getState();

    if (!isEqual(oldSlots, slots)) {
        extensionStore.setState({ slots });
    }
}

extensionInternalStore.subscribe((state) => updateExtensionOutputStore(state));
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getExtensionNameFromId(extensionId: string): string {
    const [extensionName] = extensionId.split('#');
    return extensionName;
}

function getAssignedExtensionsFromSlotData(
    slotName: string,
    internalState: ExtensionInternalStore
): Array<AssignedExtension> {
    const slot = internalState.slots?.[slotName];
    if (!slot) return [];

    const attachedExtensionsIds = slot.attachedIds;
    const extensions: Array<AssignedExtension> = [];
    for (const extensionId of attachedExtensionsIds) {
        const name = getExtensionNameFromId(extensionId);
        const extension = internalState.extensions[name];
        if (extension) {
            extensions.push({
                component: extension.component,
                id: extensionId,
                meta: extension.meta,
                moduleName: extension.moduleName,
                name: extension.name,
                
            })
        }
    }

    return extensions.sort((a, b) => {
        const orderA = internalState.extensions?.[a.name]?.order ?? 999;
        const orderB = internalState.extensions?.[b.name]?.order ?? 999;

        return orderA - orderB;
    })
}

// ============================================================================
// EXTENSION REGISTRATION
// ============================================================================

export function registerExtension(extensionRegistrationState: ExtensionRegistration) {
    console.log('[REGISTERING EXTENSIONS]', extensionRegistrationState.name);
        const allExtensions = getExtensionInternalStore().getState();
    console.log('allExtensions:', allExtensions);
    updateExtensionInternalStore((state) => {
        return {
            ...state,
            extensions: {
                ...state.extensions,
                [extensionRegistrationState.name]: {
                    ...extensionRegistrationState,
                    instances: []
                }
            }
        }
    })
}

// ============================================================================
// EXTENSION SLOT REGISTRATION
// ============================================================================

export function createNewExtensionSlotInfo(slotName: string, moduleName?: string, state?: Record<string | number | symbol, unknown>): ExtensionSlotInfo {
    return {
        name: slotName,
        moduleName,
        state,
        attachedIds: []
    }
}

export function registerExtensionSlot(
    moduleName: string,
    slotName: string,
    state?: Record<string | number | symbol, unknown>
): void {
    console.log('[REGISTERING EXTENSION SLOT]', slotName)
    updateExtensionInternalStore((currentState) => {
        console.log('currentState:',currentState);
        const existingSlot = currentState.slots[slotName];
        const existingModuleName = existingSlot?.moduleName;
        if (existingModuleName && existingModuleName !== moduleName) {
            console.warn(`Extension slot "${slotName}" already registered with module ${existingModuleName}. Refusing to register from ${moduleName}.`);
            return currentState;
        }

        // if (existingModuleName && existingModuleName === moduleName) {
        //     return currentState;
        // }
        console.log('existingSlot:', existingSlot);

        if (existingSlot) {
            return {
                ...currentState,
                slots: {
                    ...currentState.slots,
                    [slotName]: {
                        ...existingSlot,
                        state,
                        moduleName
                    }
                }
            }
        };

        const newSlot = createNewExtensionSlotInfo(slotName, moduleName, state);
        return {
            ...currentState,
            slots: {
                ...currentState.slots,
                [slotName]: newSlot
            }
        }
    })
}

export function updateExtensionSlot(
    slotName: string,
    state: Record<string | number | symbol, unknown>
) {
    updateExtensionInternalStore((currentState) => {
        const existingSlot = currentState?.slots?.[slotName];
        if (!existingSlot) {
            console.warn(`Extension slot "${slotName}" does not exist.`);
            return currentState;
        }

        return {
            ...currentState,
            slots: {
                ...currentState.slots,
                [slotName]: {
                    ...existingSlot,
                    state
                }
            }
        }
    })
}

export function attach(slotName: string, extensionId: string, moduleName?: string) {
    console.log('[ATTACHING]', `Slot "${slotName}"`, ' With ', `Extension "${extensionId}"`);
    updateExtensionInternalStore((currentState) => {
        const existingSlot = currentState.slots?.[slotName];

        if (!existingSlot) {
            return {
                ...currentState,
                slots: {
                    ...currentState.slots,
                    [slotName]: {
                        ...createNewExtensionSlotInfo(slotName, moduleName),
                        attachedIds: [extensionId]
                    }
                }
            }
        } else {
            if (existingSlot.attachedIds?.includes(extensionId)) {
                console.warn(`Extension slot "${slotName}" already has ${extensionId}`);
                return currentState;
            }

            return {
                ...currentState,
                slots: {
                    ...currentState.slots,
                    [slotName]: {
                        ...existingSlot,
                        attachedIds: [...existingSlot.attachedIds, extensionId]
                    }
                }
            }
        }
    })
}

export function detach(slotName: string, extensionId: string) {
    updateExtensionInternalStore((currentState) => {
        const existingSlot = currentState.slots?.[slotName];

        if (!existingSlot) {
            console.warn(`Extension slot "${slotName}" is not found. Refusing to detach`);
            return currentState;
        }

        if (!existingSlot.attachedIds?.includes(extensionId)) {
            console.warn(`Extension slot "${slotName}" doesn't have ${extensionId}. Refusing to detach`);
            return currentState;
        }

        return {
            ...currentState,
            slots: {
                ...currentState.slots,
                [slotName]: {
                    ...existingSlot,
                    attachedIds: existingSlot.attachedIds?.filter((id) => id !== extensionId)
                }
            }
        }
    })
}

// For internal purpose
export function getAssignedExtensions(slotName: string) {
    const interalState = extensionInternalStore.getState();
    return getAssignedExtensionsFromSlotData(slotName, interalState);
}

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useAssignedExtensions(slotName: string): Array<AssignedExtension> {
    return extensionStore?.getState()?.slots?.[slotName]?.assignedExtensions ?? [];
}

export function useExtensionSlot (
    moduleName: string,
    slotName: string,
    state?: Record<string | number | symbol, unknown>
) {
    const isInitialRender = useRef(true);

    useEffect(() => {
        // registerExtensionSlot(moduleName, slotName, state);
        isInitialRender.current = false;
    },[]);

    useEffect(() => {
        if(!isInitialRender.current && state) {
            // updateExtensionSlot(slotName, state);
        }
    },[state, slotName]);

    const extensions = useAssignedExtensions(slotName);

    return {
        extensions,
        extensionSlotName: slotName,
        extensionSlotModuleName: moduleName,
    }
}
