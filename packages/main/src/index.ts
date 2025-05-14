import type {AppInitConfig} from './AppInitConfig.js';
import {createModuleRunner} from './ModuleRunner.js';
// Core modules
import {createWindowManagerModule} from './modules/WindowManager.js';
import {disallowMultipleAppInstance} from './modules/SingleInstanceApp.js';
import {terminateAppOnLastWindowClose} from './modules/ApplicationTerminatorOnLastWindowClose.js';
import {hardwareAccelerationMode} from './modules/HardwareAccelerationModule.js';
// import {autoUpdater} from './modules/AutoUpdater.js';
// Security modules
import {allowInternalOrigins} from './modules/BlockNotAllowedOrigins.js';
import {allowExternalUrls} from './modules/ExternalUrls.js';
import { app, session, BrowserWindow } from 'electron';

/**
 * Initializes the application with the specified configuration.
 * Sets up all necessary modules in the appropriate order.
 *
 * @param initConfig The application initialization configuration
 */
export async function initApp(initConfig: AppInitConfig) {
  // Create and configure the module runner with all required modules
  const moduleRunner = createModuleRunner()
    // Core application modules
    .init(createWindowManagerModule({
      initConfig,
      openDevTools: import.meta.env.DEV
    }))
    .init(disallowMultipleAppInstance())
    .init(terminateAppOnLastWindowClose())
    .init(hardwareAccelerationMode({enable: false}))
    // .init(autoUpdater())

    // Install DevTools extension if needed
    // .init(chromeDevToolsExtension({extension: 'VUEJS3_DEVTOOLS'}))

    // Security
    .init(allowInternalOrigins(
      new Set(initConfig.renderer instanceof URL ? [initConfig.renderer.origin] : []),
    ))
    .init(allowExternalUrls(
      new Set(
        initConfig.renderer instanceof URL
          ? [
            'https://vite.dev',
            'https://developer.mozilla.org',
            'https://solidjs.com',
            'https://qwik.dev',
            'https://lit.dev',
            'https://react.dev',
            'https://preactjs.com',
            'https://www.typescriptlang.org',
            'https://vuejs.org',
          ]
          : [],
      )),
    );

  // Thiết lập CSP (Content Security Policy)
  // app.whenReady().then(() => {
  //   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //     callback({
  //       responseHeaders: {
  //         ...details.responseHeaders,
  //         'Content-Security-Policy': [
  //           "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
  //         ]
  //       }
  //     });
  //   });
  // });

  // Await completion of all module initialization
  await moduleRunner;
}
