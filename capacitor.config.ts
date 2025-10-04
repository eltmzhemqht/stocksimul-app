import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stocksimul.app',
  appName: 'StockSimul',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'https://nugu-stocksimul-app.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
