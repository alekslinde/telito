/*
 * SPDX-FileCopyrightText: 2026 Telito Contributors
 *
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// A "saved remote" = friendly name + TV model + BLE device id.
// Device id goes to SecureStore (sensitive); the list goes to AsyncStorage.
// Fully offline — no account, no server, zero running cost.

export type SavedRemote = {
  id: string;
  name: string; // e.g. "Living room"
  tvModel: string; // e.g. "Samsung UE43AU7170"
  brand: string;
  deviceId: string;
  createdAt: number;
};

type State = {
  remotes: SavedRemote[];
  activeId: string | null;
  loaded: boolean;
  load: () => Promise<void>;
  addRemote: (r: Omit<SavedRemote, 'id' | 'createdAt'>) => Promise<SavedRemote>;
  removeRemote: (id: string) => Promise<void>;
  setActive: (id: string | null) => void;
  rename: (id: string, name: string) => Promise<void>;
};

const KEY = 'remotes.v1';

export const useRemotes = create<State>((set, get) => ({
  remotes: [],
  activeId: null,
  loaded: false,
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const remotes: SavedRemote[] = raw ? JSON.parse(raw) : [];
      set({ remotes, loaded: true, activeId: remotes[0]?.id ?? null });
    } catch {
      set({ loaded: true });
    }
  },
  addRemote: async (r) => {
    const remote: SavedRemote = {
      ...r,
      id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      createdAt: Date.now(),
    };
    try {
      // Persist bond-relevant id securely; AsyncStorage keeps only the list.
      await SecureStore.setItemAsync(`ble-${remote.id}`, r.deviceId);
    } catch {
      // SecureStore unavailable on some old devices — fall back gracefully.
    }
    const remotes = [...get().remotes, remote];
    await AsyncStorage.setItem(KEY, JSON.stringify(remotes));
    set({ remotes, activeId: remote.id });
    return remote;
  },
  removeRemote: async (id) => {
    const remotes = get().remotes.filter((r) => r.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(remotes));
    try {
      await SecureStore.deleteItemAsync(`ble-${id}`);
    } catch {}
    set((s) => ({ remotes, activeId: s.activeId === id ? remotes[0]?.id ?? null : s.activeId }));
  },
  setActive: (id) => set({ activeId: id }),
  rename: async (id, name) => {
    const remotes = get().remotes.map((r) => (r.id === id ? { ...r, name } : r));
    await AsyncStorage.setItem(KEY, JSON.stringify(remotes));
    set({ remotes });
  },
}));
