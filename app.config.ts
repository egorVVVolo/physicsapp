import type { ExpoConfig } from 'expo/config';
import { APP_NAME, APP_SLUG } from './src/config.ts';

const config: ExpoConfig = {
  name: APP_NAME,
  slug: APP_SLUG,
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: APP_SLUG,
  userInterfaceStyle: 'automatic',
  ios: { icon: { light: './assets/images/icon.png', dark: './assets/images/icon-dark.png' } },
  android: {
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: { output: 'static', favicon: './assets/images/favicon.png' },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-status-bar',
    ['expo-splash-screen', { backgroundColor: '#FFFFFF', image: './assets/images/splash-icon.png', imageWidth: 120, dark: { backgroundColor: '#101419' } }],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
};

export default config;
