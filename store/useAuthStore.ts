"use client";

import { create } from "zustand";

type AuthState = {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userEmail: null,
  setUserEmail: (userEmail) => set({ userEmail }),
}));
