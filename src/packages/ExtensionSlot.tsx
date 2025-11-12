import { useExtensionSlot } from "./store";
import type { AssignedExtension } from "./types";

interface ExtensionSlotProps {
    name: string;
    moduleName: string;
    state?: Record<string | number | symbol, unknown>;
    children?: React.ReactNode | ((extension: AssignedExtension) => React.ReactNode);
    className?: string;
    style?: React.CSSProperties;
}

export function ExtensionSlot({
    name,
    moduleName,
    state,
    children,
    className,
    style,
}: ExtensionSlotProps) {
    const { extensions } = useExtensionSlot(moduleName, name, state);

    return (
        <div
            data-extension-slot-name={name}
            data-extension-slot-module-name={moduleName}
            className={className}
            style={{ ...style, position: 'relative' }}
        >
            {extensions.map((extension) => {
                const ExtensionComponent = extension.component;

                if (typeof children === 'function') {
                    return (
                        <div key={extension.id} data-extension-id={extension.id}>
                            {children(extension)}
                        </div>
                    );
                }

                return (
                    <div
                        key={extension.id}
                        data-extension-id={extension.id}
                        style={{ position: 'relative' }}
                    >
                        {children || <ExtensionComponent {...state} meta={extension.meta} />}
                    </div>
                );
            })}
        </div>
    );
}