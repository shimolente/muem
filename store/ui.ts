import { create } from 'zustand';

/**
 * Global UI state — menu, preloader, modals.
 * GSAP animations can subscribe to this outside React components.
 */

interface UIState {
  menuOpen:       boolean;
  preloaderDone:  boolean;
  activeProject:  string | null;
  /** 'light' = white text/logo (dark bg sections). 'dark' = dark text/logo (light bg sections). */
  navTheme:         'light' | 'dark';
  /** 'full' = all links visible. 'minimal' = hamburger icon only (all viewports). */
  navStyle:         'full' | 'minimal';
  /** Override logo to white even when navTheme is 'dark' (left column active). */
  navLogoLight:     boolean;
  /** Override hamburger bars to white even when navTheme is 'dark' (right column active). */
  navHamburgerLight: boolean;
  /** Background fill for the navbar bar. 'cream' adds a solid off-white bg (used on inner-page grid sections). */
  navBg: 'transparent' | 'cream';

  setMenuOpen:          (open: boolean)                    => void;
  setPreloaderDone:     (done: boolean)                    => void;
  setActiveProject:     (slug: string | null)              => void;
  setNavTheme:          (theme: 'light' | 'dark')          => void;
  setNavStyle:          (style: 'full' | 'minimal')        => void;
  setNavLogoLight:      (v: boolean)                       => void;
  setNavHamburgerLight: (v: boolean)                       => void;
  setNavBg:             (bg: 'transparent' | 'cream')      => void;
}

export const useUIStore = create<UIState>((set) => ({
  menuOpen:          false,
  preloaderDone:     false,
  activeProject:     null,
  navTheme:          'light',
  navStyle:          'full',
  navLogoLight:      false,
  navHamburgerLight: false,
  navBg:             'transparent',

  setMenuOpen:          (open)  => set({ menuOpen: open }),
  setPreloaderDone:     (done)  => set({ preloaderDone: done }),
  setActiveProject:     (slug)  => set({ activeProject: slug }),
  setNavTheme:          (theme) => set({ navTheme: theme }),
  setNavStyle:          (style) => set({ navStyle: style }),
  setNavLogoLight:      (v)     => set({ navLogoLight: v }),
  setNavHamburgerLight: (v)     => set({ navHamburgerLight: v }),
  setNavBg:             (bg)    => set({ navBg: bg }),
}));
