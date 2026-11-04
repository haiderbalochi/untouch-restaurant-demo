"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CONFIG_MESSAGE,
  DEFAULT_SETTINGS,
  subscribeBanners,
  subscribeCategories,
  subscribeProducts,
  subscribeReviews,
  subscribeSettings,
} from "@/lib/data/catalog";
import { FIREBASE_READY } from "@/lib/firebase/client";
import { useDemoModeStore } from "@/lib/demo/mode";
import { useDemoStore } from "@/lib/demo/store";
import type { Banner, Category, Product, RestaurantSettings, Review } from "@/lib/types";

interface LiveState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  /** True when the storefront is rendering the bundled demo catalogue. */
  preview: boolean;
}

type Unsubscribe = () => void;

interface LiveValue<T> {
  live: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Subscribes to a live Realtime Database node. When the node is empty the
 * storefront falls back to the bundled demo catalogue (see lib/demo/seed.ts).
 */
function useLiveValue<T>(
  start: (
    onData: (value: T) => void,
    onError: (message: string) => void,
  ) => Unsubscribe,
  deps: unknown[],
): LiveValue<T> {
  const [live, setLive] = useState<T | null>(null);
  const [loading, setLoading] = useState(FIREBASE_READY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!FIREBASE_READY) {
      setLoading(false);
      return;
    }
    let active = true;
    const unsubscribe = start(
      (value) => {
        if (!active) return;
        setLive(value);
        setError(null);
        setLoading(false);
      },
      (message) => {
        if (!active) return;
        setError(message);
        setLive(null);
        setLoading(false);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { live, loading, error };
}

export function useProducts(options?: { includeUnavailable?: boolean }): LiveState<Product[]> {
  const includeUnavailable = options?.includeUnavailable ?? false;
  const demoProducts = useDemoStore((state) => state.products);
  const catalogEmpty = useDemoModeStore((state) => state.catalogEmpty);

  const { live, loading, error } = useLiveValue<Product[]>(
    (onData, onError) => subscribeProducts(onData, onError, includeUnavailable),
    [includeUnavailable],
  );

  const demo = !FIREBASE_READY || catalogEmpty;

  useEffect(() => {
    if (!FIREBASE_READY || live === null) return;
    useDemoModeStore.getState().setCatalogEmpty(live.length === 0);
    useDemoModeStore.getState().setLiveCatalog(live.length > 0);
  }, [live]);

  useEffect(() => {
    if (!FIREBASE_READY) useDemoModeStore.getState().setCatalogEmpty(true);
    if (error) useDemoModeStore.getState().setCatalogEmpty(true);
  }, [error]);

  const visibleDemo = useMemo(
    () => demoProducts.filter((product) => includeUnavailable || product.available),
    [demoProducts, includeUnavailable],
  );
  const data = useMemo(
    () => (demo ? visibleDemo : live ?? []),
    [demo, visibleDemo, live],
  );

  return {
    data,
    loading: demo ? false : loading,
    error,
    preview: demo,
  };
}

export function useCategories(options?: { includeInactive?: boolean }): LiveState<Category[]> {
  const includeInactive = options?.includeInactive ?? false;
  const demoCategories = useDemoStore((state) => state.categories);
  const demo = !FIREBASE_READY || useDemoModeStore((state) => state.catalogEmpty);

  const { live, loading, error } = useLiveValue<Category[]>(
    (onData, onError) => subscribeCategories(onData, onError, includeInactive),
    [includeInactive],
  );

  const visibleDemo = useMemo(
    () => demoCategories.filter((category) => includeInactive || category.active),
    [demoCategories, includeInactive],
  );
  const data = useMemo(
    () => (demo ? visibleDemo : live ?? []),
    [demo, visibleDemo, live],
  );

  return {
    data,
    loading: demo ? false : loading,
    error,
    preview: demo,
  };
}

export function useBanners(options?: { includeInactive?: boolean }): LiveState<Banner[]> {
  const includeInactive = options?.includeInactive ?? false;
  const demoBanners = useDemoStore((state) => state.banners);
  const demo = !FIREBASE_READY || useDemoModeStore((state) => state.catalogEmpty);

  const { live, loading, error } = useLiveValue<Banner[]>(
    (onData, onError) => subscribeBanners(onData, onError, includeInactive),
    [includeInactive],
  );

  const visibleDemo = useMemo(
    () => demoBanners.filter((banner) => includeInactive || banner.active),
    [demoBanners, includeInactive],
  );
  const data = useMemo(
    () => (demo ? visibleDemo : live ?? []),
    [demo, visibleDemo, live],
  );

  return {
    data,
    loading: demo ? false : loading,
    error,
    preview: demo,
  };
}

export function useReviews(options?: { includeAll?: boolean }): LiveState<Review[]> {
  const includeAll = options?.includeAll ?? false;
  const demoReviews = useDemoStore((state) => state.reviews);
  const catalogEmpty = useDemoModeStore((state) => state.catalogEmpty);
  const serverDemo = useDemoModeStore((state) => state.serverDemo);
  // `includeAll` is the admin moderation view: it follows the dashboard's demo verdict.
  const demo = !FIREBASE_READY || catalogEmpty || (includeAll && serverDemo);

  const { live, loading, error } = useLiveValue<Review[]>(
    (onData, onError) => subscribeReviews(onData, onError, includeAll),
    [includeAll],
  );

  const visibleDemo = useMemo(
    () =>
      includeAll ? demoReviews : demoReviews.filter((review) => review.status === "approved"),
    [demoReviews, includeAll],
  );
  const data = useMemo(
    () => (demo ? visibleDemo : live ?? []),
    [demo, visibleDemo, live],
  );

  return {
    data,
    loading: demo ? false : loading,
    error,
    preview: demo,
  };
}

export function useSettings(): LiveState<RestaurantSettings> {
  const demoSettings = useDemoStore((state) => state.settings);
  const demo = !FIREBASE_READY || useDemoModeStore((state) => state.catalogEmpty);

  const { live, loading, error } = useLiveValue<RestaurantSettings>(
    (onData, onError) => subscribeSettings(onData, onError),
    [],
  );

  return {
    data: demo ? demoSettings : live ?? DEFAULT_SETTINGS,
    loading: demo ? false : loading,
    error,
    preview: demo,
  };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

export { CONFIG_MESSAGE };
