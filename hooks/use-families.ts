"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";

interface Family {
  id: string;
  name: string;
}

interface FamiliesStore {
  families: Family[];
  isLoading: boolean;
  error: string | null;
  fetchFamilies: () => Promise<void>;
}

export const useFamiliesStore = create<FamiliesStore>((set) => ({
  families: [],
  isLoading: true,
  error: null,
  fetchFamilies: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/families");
      if (!response.ok) throw new Error("Failed to fetch families");
      const data = await response.json();
      set({ families: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching families:", error);
      set({ error: "Failed to fetch families", isLoading: false });
    }
  },
}));

export function useFamilies() {
  const store = useFamiliesStore();
  
  useEffect(() => {
    store.fetchFamilies();
  }, []);

  return {
    families: store.families,
    isLoading: store.isLoading,
    error: store.error,
    refetchFamilies: store.fetchFamilies,
  };
} 