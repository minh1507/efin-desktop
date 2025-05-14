import { AbstractSecurityModule } from './AbstractSecurityModule.js';
import { shell } from 'electron';
import { URL } from 'node:url';

/**
 * Module for handling external URL requests securely.
 * Opens allowed external URLs in the default browser and blocks disallowed ones.
 */
export class ExternalUrls extends AbstractSecurityModule {
  readonly #allowedExternalOrigins: Set<string>;

  /**
   * Creates a new instance of ExternalUrls
   * @param allowedExternalOrigins Set of external origin URLs that are permitted to be opened
   */
  constructor(allowedExternalOrigins: Set<string>) {
    super();
    this.#allowedExternalOrigins = allowedExternalOrigins;
  }

  applyRule(contents: Electron.WebContents): void {
    contents.setWindowOpenHandler(({ url }) => {
      const { origin } = new URL(url);

      if (this.#allowedExternalOrigins.has(origin)) {
        // Open allowed external URLs in the system's default browser
        shell.openExternal(url).catch(err => {
          console.error(`Failed to open external URL: ${url}`, err);
        });
      } else if (import.meta.env.DEV) {
        console.warn(`Blocked opening disallowed external origin: ${origin}`);
      }

      // Always deny creating a new window in the application
      return { action: 'deny' };
    });
  }
}

/**
 * Creates a new instance of ExternalUrls with the specified allowed external origins
 * @param args Constructor parameters for ExternalUrls
 * @returns A new ExternalUrls instance
 */
export function allowExternalUrls(...args: ConstructorParameters<typeof ExternalUrls>) {
  return new ExternalUrls(...args);
}
