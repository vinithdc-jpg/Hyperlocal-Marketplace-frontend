'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      lat: null,
      lng: null,
      radius: 10,
      setLocation: (lat, lng) => set({ lat, lng }),
      setRadius: (radius) => set({ radius }),
      clearLocation: () => set({ lat: null, lng: null }),
    }),
    { name: 'neighbormart-location' }
  )
);

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const dark = !get().dark;
        document.documentElement.classList.toggle('dark', dark);
        set({ dark });
      },
      init: () => {
        const dark = get().dark;
        document.documentElement.classList.toggle('dark', dark);
      },
    }),
    { name: 'neighbormart-theme' }
  )
);

export const useFilterStore = create((set) => ({
  search: '',
  category: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () =>
    set({ search: '', category: '', condition: '', minPrice: '', maxPrice: '', sort: 'newest' }),
}));
