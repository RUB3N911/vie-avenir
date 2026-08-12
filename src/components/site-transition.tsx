"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LoaderPhase = "visible" | "revealing" | "hidden";
type PagePhase = "entered" | "exiting" | "entering";

const LOADER_HOLD_MS = 1800;
const LOADER_REVEAL_MS = 800;
const PAGE_TRANSITION_MS = 500;

export function SiteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const transitionsEnabled = !pathname.startsWith("/admin");
  const router = useRouter();
  const [loaderPhase, setLoaderPhase] = useState<LoaderPhase>("visible");
  const [pagePhase, setPagePhase] = useState<PagePhase>("entered");
  const loaderPhaseRef = useRef<LoaderPhase>("visible");
  const pagePhaseRef = useRef<PagePhase>("entered");
  const pendingNavigation = useRef<string | null>(null);
  const previousRouteKey = useRef(routeKey);
  const reducedMotion = useRef(false);
  const timers = useRef<Set<number>>(new Set());
  const animationFrames = useRef<Set<number>>(new Set());

  const changeLoaderPhase = useCallback((nextPhase: LoaderPhase) => {
    loaderPhaseRef.current = nextPhase;
    setLoaderPhase(nextPhase);
  }, []);

  const changePagePhase = useCallback((nextPhase: PagePhase) => {
    pagePhaseRef.current = nextPhase;
    setPagePhase(nextPhase);
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const enterPage = useCallback(() => {
    changePagePhase("entering");

    const firstFrame = window.requestAnimationFrame(() => {
      animationFrames.current.delete(firstFrame);
      const secondFrame = window.requestAnimationFrame(() => {
        animationFrames.current.delete(secondFrame);
        changePagePhase("entered");
      });
      animationFrames.current.add(secondFrame);
    });
    animationFrames.current.add(firstFrame);
  }, [changePagePhase]);

  useEffect(() => {
    const pendingTimers = timers.current;
    const pendingFrames = animationFrames.current;
    reducedMotion.current =
      !transitionsEnabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion.current) {
      changeLoaderPhase("hidden");
      return;
    }

    schedule(() => {
      changeLoaderPhase("revealing");
      schedule(() => changeLoaderPhase("hidden"), LOADER_REVEAL_MS);
    }, LOADER_HOLD_MS);

    return () => {
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
      pendingTimers.clear();
      pendingFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      pendingFrames.clear();
    };
  }, [changeLoaderPhase, schedule, transitionsEnabled]);

  useEffect(() => {
    const isBusy = transitionsEnabled && (loaderPhase !== "hidden" || pagePhase !== "entered");
    document.body.classList.toggle("is-transitioning", isBusy);
    return () => document.body.classList.remove("is-transitioning");
  }, [loaderPhase, pagePhase, transitionsEnabled]);

  useEffect(() => {
    if (!transitionsEnabled) return;
    if (previousRouteKey.current === routeKey) return;

    const cameFromHistory = pendingNavigation.current === "history";
    previousRouteKey.current = routeKey;
    pendingNavigation.current = null;

    if (reducedMotion.current) {
      changePagePhase("entered");
      return;
    }

    schedule(enterPage, cameFromHistory ? PAGE_TRANSITION_MS : 0);
  }, [changePagePhase, enterPage, routeKey, schedule, transitionsEnabled]);

  useEffect(() => {
    if (!transitionsEnabled) return;
    const handleInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const current = new URL(window.location.href);
      if (
        destination.pathname === current.pathname &&
        destination.search === current.search
      ) {
        return;
      }

      if (reducedMotion.current) return;

      event.preventDefault();
      if (loaderPhaseRef.current !== "hidden" || pagePhaseRef.current !== "entered") return;

      const href = `${destination.pathname}${destination.search}${destination.hash}`;
      pendingNavigation.current = href;
      changePagePhase("exiting");
      schedule(() => router.push(href), PAGE_TRANSITION_MS);
    };

    const handleHistoryNavigation = () => {
      const destination = new URL(window.location.href);
      const destinationRouteKey = `${destination.pathname}?${destination.searchParams.toString()}`;

      if (
        previousRouteKey.current === destinationRouteKey ||
        reducedMotion.current ||
        loaderPhaseRef.current !== "hidden" ||
        pagePhaseRef.current !== "entered"
      ) {
        return;
      }
      pendingNavigation.current = "history";
      changePagePhase("exiting");
    };

    document.addEventListener("click", handleInternalLink, true);
    window.addEventListener("popstate", handleHistoryNavigation);

    return () => {
      document.removeEventListener("click", handleInternalLink, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
    };
  }, [changePagePhase, router, schedule, transitionsEnabled]);

  if (!transitionsEnabled) return <>{children}</>;

  return (
    <>
      <div className={`site-page-transition site-page-${pagePhase}`}>{children}</div>
      <div className={`site-loader site-loader-${loaderPhase}`} aria-hidden="true">
        <div className="site-loader-glow" />
        <div className="site-loader-brand">
          <Image
            className="site-loader-logo"
            src="/images/brand/logo-vie-avenir.webp"
            alt=""
            width={300}
            height={200}
            priority
          />
          <p><span>VIE</span> AVENIR</p>
          <small>VA ET DEVIENS !</small>
          <span className="site-loader-line" />
        </div>
      </div>
      {loaderPhase !== "hidden" || pagePhase !== "entered" ? (
        <p className="sr-only" role="status">Chargement de la page</p>
      ) : null}
    </>
  );
}
