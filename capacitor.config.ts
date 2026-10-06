import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.form.workout',
  appName: 'FORM',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    allowNavigation: ['work-out-vert.vercel.app', '*.vercel.app']
  }
};

export default config;
