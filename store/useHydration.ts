"use client"

import { useSyncExternalStore } from "react";

/**
 * useHydration
 * -----------------------------------------------------------------------
 * Senior-level note (why this hook exists):
 *
 * Every persisted Zustand store (cart, wishlist) reads its initial value
 * from localStorage. localStorage does not exist on the server, so the
 * first client render must match the server's empty/default state, then
 * "flip" once the persisted value has been read from disk. This app was
 * solving that with the same local pattern repeated in 5 different
 * components (Navbar, BottomNav, ProductCard, WishlistButton, CartDrawer):
 *
 *   const [mounted, setMounted] = useState(false);
 *   useEffect(() => setMounted(true), []);
 *
 * That works, but it means every one of those components pays for its own
 * extra commit after mount (mount -> effect -> setState -> re-render),
 * multiplied by however many ProductCards are on the page. On a grid of
 * 40 products that is 40 avoidable state updates and 40 avoidable
 * re-renders, purely to answer one yes/no question: "has hydration run?"
 *
 * This hook answers that question exactly once, from a single shared
 * source of truth, using useSyncExternalStore (the same primitive React
 * itself uses for external stores). Every component that calls this hook
 * subscribes to the same tiny store instead of running its own effect,
 * so the "flip" happens in one shared render pass instead of N separate
 * ones, and there is a single, obvious place that owns hydration status.
 */

type Listener = () => void;

let hydrated = false;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return hydrated;
}

// Server (and the very first client paint) must always see `false`,
// otherwise React will log a hydration mismatch warning.
function getServerSnapshot() {
  return false;
}

/**
 * Call this exactly once, as early as possible on the client
 * (e.g. from a top-level <ClientBoot /> mounted in Providers.tsx).
 * Calling it more than once is harmless — it's a no-op after the first call.
 */
export function markHydrated() {
  if (hydrated) return;
  hydrated = true;
  listeners.forEach((listener) => listener());
}

/**
 * useHydration
 * Returns `true` once the client has painted at least one frame past the
 * initial SSR markup, meaning it is now safe to read persisted
 * (localStorage-backed) Zustand state without risking a hydration mismatch.
 */
export function useHydration() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}