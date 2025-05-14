import { AppModule } from '../AppModule.js';
import { ModuleContext } from '../ModuleContext.js';

/**
 * Abstract base class for security modules that need to apply rules to WebContents.
 * Security modules using this base class will automatically be applied to all newly created web contents.
 */
export abstract class AbstractSecurityModule implements AppModule {
  /**
   * Enables the security module by registering it to the 'web-contents-created' event.
   * @param context The module context containing the app instance
   */
  enable({ app }: ModuleContext): void {
    app.on('web-contents-created', (_, contents) => this.applyRule(contents));
  }

  /**
   * Abstract method that must be implemented by subclasses to apply specific security rules.
   * @param contents The Electron WebContents instance to apply the rule to
   */
  abstract applyRule(contents: Electron.WebContents): void;
}
