export type ForegroundAppInfo = {
  /** Android: package name. iOS: base64-encoded ApplicationToken. */
  packageName: string;
  appName: string | null;
};

export type SelectedAppInfo = {
  /** iOS: base64-encoded ApplicationToken (no Android equivalent). */
  identifier: string;
  name: string | null;
};

type ZenAppUsageModuleNative = {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  getCurrentForegroundApp(): Promise<ForegroundAppInfo | null>;
  startMonitoring(intervalMs: number): Promise<void>;
  stopMonitoring(): Promise<void>;
  isMonitoring(): Promise<boolean>;
  requestAuthorization?(): Promise<boolean>;
  presentAppSelectionPicker?(): Promise<SelectedAppInfo[] | null>;
};

declare const ZenAppUsageModule: ZenAppUsageModuleNative | undefined;

export default ZenAppUsageModule;