import {AppModule} from './AppModule.js';
import {ModuleContext} from './ModuleContext.js';
import {app} from 'electron';

/**
 * ModuleRunner is responsible for initializing and sequentially running application modules.
 * It manages the lifecycle of modules and ensures they are executed in the correct order.
 */
class ModuleRunner implements PromiseLike<void> {
  #promise: Promise<void>;

  constructor() {
    this.#promise = Promise.resolve();
  }

  /**
   * Implementation of PromiseLike interface to allow awaiting the completion of all modules.
   */
  then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): PromiseLike<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }

  /**
   * Initializes and runs a module, chaining its execution to previous modules.
   * @param module The module to initialize and run
   * @returns This ModuleRunner instance for chaining
   */
  init(module: AppModule): ModuleRunner {
    const moduleContext = this.#createModuleContext();
    const result = module.enable(moduleContext);

    // If the module returns a Promise, chain it to our promise sequence
    if (result instanceof Promise) {
      this.#promise = this.#promise.then(() => result);
    }

    return this;
  }

  /**
   * Creates a module context with access to the Electron app instance.
   * @returns A new ModuleContext
   */
  #createModuleContext(): ModuleContext {
    return {
      app,
    };
  }
}

/**
 * Creates and returns a new ModuleRunner instance.
 * @returns A new ModuleRunner
 */
export function createModuleRunner(): ModuleRunner {
  return new ModuleRunner();
}
