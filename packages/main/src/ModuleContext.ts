import type { App } from 'electron';

/**
 * Context object passed to modules during initialization.
 * Contains application dependencies and services required by modules.
 */
export interface ModuleContext {
  /**
   * The Electron application instance
   */
  app: App;
}
