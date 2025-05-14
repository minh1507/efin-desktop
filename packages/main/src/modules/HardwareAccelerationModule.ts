import {AppModule} from '../AppModule.js';
import {ModuleContext} from '../ModuleContext.js';

/**
 * Module for controlling hardware acceleration settings in the application.
 * Allows enabling or disabling hardware acceleration based on configuration.
 */
export class HardwareAccelerationModule implements AppModule {
  readonly #enableHardwareAcceleration: boolean;

  /**
   * Creates a new instance of HardwareAccelerationModule
   * @param config Configuration for hardware acceleration
   * @param config.enable Whether hardware acceleration should be enabled
   */
  constructor({enable}: {enable: boolean}) {
    this.#enableHardwareAcceleration = enable;
  }

  /**
   * Enables the module by configuring hardware acceleration based on the provided settings
   * @param context The module context containing the app instance
   */
  enable({app}: ModuleContext): void {
    if (!this.#enableHardwareAcceleration) {
      app.disableHardwareAcceleration();
    }
  }
}

/**
 * Creates a new instance of HardwareAccelerationModule with the specified configuration
 * @param args Constructor parameters for HardwareAccelerationModule
 * @returns A new HardwareAccelerationModule instance
 */
export function hardwareAccelerationMode(...args: ConstructorParameters<typeof HardwareAccelerationModule>) {
  return new HardwareAccelerationModule(...args);
}
