export type NavigationEvent =
  "routeChangeStart" | "routeChangeComplete" | "routeChangeError";

type Handler = (...args: any[]) => void;

/**
 * Module-level replacement for the Pages Router's `router.events` emitter,
 * which does not exist in the App Router.
 *
 * `routeChangeStart` is emitted by `useCompatRouter` before a programmatic
 * navigation, so a handler that throws still aborts that navigation (the
 * "unsaved changes" guard pattern). `routeChangeComplete` is emitted by
 * `NavigationEventsBridge` once the pathname/search actually changes.
 *
 * LIMITATION: navigations started by `<Link>` clicks or browser back/forward
 * cannot be intercepted by the App Router, so they emit no `routeChangeStart`
 * and cannot be cancelled.
 */
class NavigationEventEmitter {
  private handlers: Map<NavigationEvent, Set<Handler>> = new Map();

  on(event: NavigationEvent, handler: Handler): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)?.add(handler);
  }

  off(event: NavigationEvent, handler: Handler): void {
    this.handlers.get(event)?.delete(handler);
  }

  /**
   * Runs every handler. Re-throws so callers of `routeChangeStart` can treat a
   * throwing handler as "navigation cancelled", matching Pages Router
   * behaviour.
   */
  emit(event: NavigationEvent, ...args: any[]): void {
    this.handlers.get(event)?.forEach((handler) => handler(...args));
  }
}

export const navigationEvents = new NavigationEventEmitter();
