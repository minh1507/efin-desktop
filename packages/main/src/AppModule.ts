import type { ModuleContext } from './ModuleContext.js';

/**
 * Interface for application modules.
 * All application modules must implement this interface to be initialized by the ModuleRunner.
 */
export interface AppModule {
  /**
   * Enables the module with the provided context.
   * This method is called by the ModuleRunner during application initialization.
   * 
   * @param context The module context containing application dependencies
   * @returns A Promise that resolves when the module is fully enabled, or void if synchronous
   */
  enable(context: ModuleContext): Promise<void> | void;
}
