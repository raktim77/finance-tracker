/// <reference types="@capacitor/app" />
/// <reference types="@capacitor/status-bar" />
/// <reference types="@capacitor-firebase/authentication" />

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.xpensio.app",
  appName:
    "Xpensio",
  webDir: "dist",
  backgroundColor: "#0B0F1A",
  // server: {
  //   url: 'http://192-168-29-182.nip.io:5173/',
  //   cleartext: true,
  //   // hostname: ''
  // },
  server: {
    hostname: "xpensio.vercel.app",
    androidScheme: "https",
  },
  plugins: {
    // App: {
    //   disableBackButtonHandler: true,
    // },
    // StatusBar: {
    //   style: "DARK",
    //   backgroundColor: "#000000",
    //   overlaysWebView: false,
    // },
    FirebaseAuthentication: {
      authDomain: undefined,
      skipNativeAuth: false,
      providers: ["google.com"],
    }
  },
};

export default config;
