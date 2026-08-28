export type ForegroundAppInfo = {
  packageName: string;
  appName: string | null;
};

type ZenAppUsageModuleNative = {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  getCurrentForegroundApp(): Promise<ForegroundAppInfo | null>;
  startMonitoring(intervalMs: number): Promise<void>;
  stopMonitoring(): Promise<void>;
  isMonitoring(): Promise<boolean>;
};

declare const ZenAppUsageModule: ZenAppUsageModuleNative | undefined;

export default ZenAppUsageModule;
