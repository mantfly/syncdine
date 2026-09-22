import { create } from 'zustand';
import { createUserSlice } from './useUserStore';
import { createRoomSlice } from './useRoomStore';
import { createSwipeSlice } from './useSwipeStore';

export const useAppStore = create((set, get) => {
  // Helpers to namespace set and get
  const createNamespacedSet = (namespace) => (fnOrObj) => {
    set((state) => {
      const nextSliceState = typeof fnOrObj === 'function' ? fnOrObj(state[namespace]) : fnOrObj;
      return { [namespace]: { ...state[namespace], ...nextSliceState } };
    });
  };

  const createNamespacedGet = (namespace) => () => get()[namespace];

  return {
    user: createUserSlice(createNamespacedSet('user'), createNamespacedGet('user')),
    room: createRoomSlice(createNamespacedSet('room'), createNamespacedGet('room')),
    swipe: createSwipeSlice(createNamespacedSet('swipe'), createNamespacedGet('swipe'), createNamespacedSet('room'))
  };
});
