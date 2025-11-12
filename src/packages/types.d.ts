
export interface ExtensionMeta {
    [key: string]: any;
}

export interface ExtensionRegistration {
    readonly name: string;
    readonly component: React.ComponentType<any>;
    readonly moduleName: string;
    readonly meta: Readonly<ExtensionMeta>;
    readonly order?: number;
}

export interface ExtensionInstance {
    id: string;
    slotName: string;
    slotModuleName: string;
};

export interface ExtensionInfo extends ExtensionRegistration {
    instances: Array<ExtensionInstance>;
};

export interface ExtensionSlotInfo {
    moduleName?: string;
    name: string;
    attachedIds: Array<string>;
    state?: Record<string | number | symbol, unknown>;
}

export interface ExtensionInternalStore {
    slots: Record<string, ExtensionSlotInfo>;
    extensions: Record<string, ExtensionInfo>;
}

export interface AssignedExtension extends Omit<ExtensionRegistration, 'order'> {
    id: string;
}

export interface ExtensionSlotState {
    moduleName?: string;
    assignedExtensions: Array<AssignedExtension>;
    state?: Record<string | number | symbol, unknown>;
}

// publicly accessible store
export interface ExtensionStore {
    slots: Record<string, ExtensionSlotState>;
}

export type ExtensionDefinition = {
  /**
   * The name of this extension. This is used to refer to the extension in configuration.
   */
  name: string;
  /**
   * If supplied, the slot that this extension is rendered into by default.
   */
  slot?: string;
  /**
   * If supplied, the slots that this extension is rendered into by default.
   */
  slots?: Array<string>;
  /**
   * Determines the order in which this component renders in its default extension slot. Note that this can be overridden by configuration.
   */
  order?: number;
  /**
   * The user must have ANY of these privileges to see this extension.
   */
  /**
   * Meta describes any properties that are passed down to the extension when it is loaded
   */
  meta?: {
    [k: string]: unknown;
  };
  /**
   * The name of the component exported by this frontend module.
   */
  component: React.ComponentType<any>;
};