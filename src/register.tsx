import { attach, registerExtension } from "./packages/store";
import type { ExtensionDefinition } from "./packages/types";

const extensions: Array<ExtensionDefinition> = [
  {
    name: 'welcome-banner',
    component: () => <div style={{ background: 'lightblue', padding: 20 }}>Welcome!</div>,
    meta: {},
    order: 1,
    slot: 'header-slot'
  },
  {
    name: 'stats-widget',
    component: ({ count = 0 }: { count?: number }) => <div>Stats: {count}</div>,
    meta: {},
    order: 2,
    slot: 'content-slot'
  }
];

function tryRegisterExtension(appName: string, extension: ExtensionDefinition) {
  const name = extension.name;
  const component = extension.component;

  if (!name) {
    console.error('An extensions is trying to register without name. Make sure to pass the name to register the extension.', extension);
    return;
  }

  if (!component) {
    console.error('An extensions is trying to register without component. Make sure to pass the component to register the extension.', extension);
    return;
  }

  if (extension?.slot && extension?.slots?.length) {
    console.warn(`An extension is trying to register with slot and slots as well. But slots will be prefered over slot to avoid conflict.`);
  }

  const slots = extension?.slots ? extension?.slots : extension?.slot ? [extension?.slot] : [];

  // Register extensions.
  registerExtension({
    name: extension.name,
    component: extension.component,
    meta: extension.meta || {},
    moduleName: appName,
    order: extension?.order
  })


  // Attach extension with slots
  for (const slot of slots) {
    attach(slot, extension.name, appName);
  }
}

function regiserApp(appName: string, extensions: Array<ExtensionDefinition>) {

  extensions.forEach((ext) => {
    if (ext && typeof ext === 'object' && Object.hasOwn(ext, 'name') && Object.hasOwn(ext, 'component')) {
      tryRegisterExtension(appName, ext);
    } else {
      console.warn(
        `An extension for ${appName} could not be registered as it does not appear to have the required properties`,
        ext,
      );
    }
  });
}

regiserApp('app', extensions);
