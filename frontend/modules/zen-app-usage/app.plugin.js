const {
  withAndroidManifest,
  withEntitlementsPlist,
  AndroidConfig,
  createRunOncePlugin,
} = require('@expo/config-plugins');

const PACKAGE_USAGE_STATS = 'android.permission.PACKAGE_USAGE_STATS';
const FOREGROUND_SERVICE = 'android.permission.FOREGROUND_SERVICE';
const FOREGROUND_SERVICE_SPECIAL_USE =
  'android.permission.FOREGROUND_SERVICE_SPECIAL_USE';
const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS';
const SYSTEM_ALERT_WINDOW = 'android.permission.SYSTEM_ALERT_WINDOW';

const FAMILY_CONTROLS = 'com.apple.developer.family-controls';
const APP_GROUPS = 'com.apple.security.application-groups';
const DEFAULT_IOS_APP_GROUP = 'group.com.zensweep.app';

function ensurePermission(androidManifest, permission, toolsIgnore) {
  const items = androidManifest.manifest['uses-permission'] ?? [];
  const exists = items.some(
    (item) => item.$?.['android:name'] === permission,
  );
  if (exists) {
    return;
  }

  const entry = {
    $: {
      'android:name': permission,
    },
  };
  if (toolsIgnore) {
    entry.$['tools:ignore'] = toolsIgnore;
    androidManifest.manifest.$ = {
      ...(androidManifest.manifest.$ ?? {}),
      'xmlns:tools': 'http://schemas.android.com/tools',
    };
  }
  items.push(entry);
  androidManifest.manifest['uses-permission'] = items;
}

const withZenAppUsage = (config) => {
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    ensurePermission(
      androidManifest,
      PACKAGE_USAGE_STATS,
      'ProtectedPermissions',
    );
    ensurePermission(androidManifest, FOREGROUND_SERVICE);
    ensurePermission(androidManifest, FOREGROUND_SERVICE_SPECIAL_USE);
    ensurePermission(androidManifest, POST_NOTIFICATIONS);
    ensurePermission(androidManifest, SYSTEM_ALERT_WINDOW);

    AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    const appGroup = config.ios?.appGroup ?? DEFAULT_IOS_APP_GROUP;

    config.modResults[FAMILY_CONTROLS] = true;

    const groups = config.modResults[APP_GROUPS] ?? [];
    if (!groups.includes(appGroup)) {
      groups.push(appGroup);
    }
    config.modResults[APP_GROUPS] = groups;

    return config;
  });

  return config;
};

module.exports = createRunOncePlugin(
  withZenAppUsage,
  'zen-app-usage',
  '1.0.0',
);
