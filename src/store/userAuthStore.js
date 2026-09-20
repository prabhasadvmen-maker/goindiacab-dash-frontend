import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserAuthStore = create(
  persist(
    (set) => ({
      user: null,
      userToken: null,

      userLogin: (user, token) => set({ user, userToken: token }),
      
      userLogout: () => set({ user: null, userToken: null }),
      
      updateUser: (data) => set((state) => ({ 
        user: { ...state.user, ...data } 
      })),
    }),
    {
      name: 'goindiacab_user_auth',
    }
  )
);
