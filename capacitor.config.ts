import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stocksimul.app',
  appName: 'StockSimul',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    url: 'http://121.143.241.73:5000',
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
