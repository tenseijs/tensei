/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Exposes the API to register and execute async hooks
 */
export class Hooks {
  private hooks: {
    before: Map<string, ((...args: any[]) => void | Promise<void>)[]>
    after: Map<string, ((...args: any[]) => void | Promise<void>)[]>
  } = {
    before: new Map(),
    after: new Map()
  }

  /**
   * Register hook for a given action and lifecycle
   */
  public add(
    lifecycle: 'before' | 'after',
    action: string,
    handler: (...args: any[]) => void | Promise<void>
  ): this {
    const handlers = this.hooks[lifecycle].get(action)
    if (handlers) {
      handlers.push(handler)
    } else {
      this.hooks[lifecycle].set(action, [handler])
    }

    return this
  }

  /**
   * Execute hooks for a given action and lifecycle
   */
  public async execute(
    lifecycle: 'before' | 'after',
    action: string,
    data: any
  ): Promise<void> {
    const handlers = this.hooks[lifecycle].get(action)
    if (!handlers) {
      return
    }

    for (let handler of handlers) {
      await handler(data as any)
    }
  }
}
