type DemoDirId = string;
type Path = string;

type DemoDir = {
  label: string;
  path: Path;
};

export type StoreSchema = {
  demoDirs: Record<DemoDirId, DemoDir>;
  rconPassword: string | undefined;
  enableLocationOverlay: boolean;
  exampleBoolean: boolean;
};

export const storeDefaults: Required<StoreSchema> = {
  demoDirs: {},
  rconPassword: undefined,
  enableLocationOverlay: false,
  exampleBoolean: true,
};

function deserialize(storeValue: string | null) {
  if (storeValue !== null) {
    try {
      return JSON.parse(storeValue);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function getStoreValue<K extends keyof StoreSchema>(
  key: K
): StoreSchema[K] {
  return deserialize(window.localStorage.getItem(key)) ?? storeDefaults[key];
}
