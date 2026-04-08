/// <reference types="@capacitor/app" />
/// <reference types="@capacitor/status-bar" />

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.xpensio.app",
  appName:
    "Xpensio - The one-stop solution to all your expense management needs",
  webDir: "dist",
  server: {
    url: 'http://192-168-29-182.nip.io:5173/',
    cleartext: true,
    // hostname: ''
  },
  // server: {
  //   hostname: "xpensio.vercel.app",
  //   androidScheme: "https",
  // },
  plugins: {
    // App: {
    //   disableBackButtonHandler: true,
    // },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
      overlaysWebView: false,
    },
  },
};

export default config;
