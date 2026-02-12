import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "../../types/domain";
import { readStoredAuthUser } from "./auth.storage";

interface AuthState {
  user: SessionUser | null;
  bootstrapped: boolean;
}

const initialState: AuthState = {
  user: readStoredAuthUser(),
  bootstrapped: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
    },
    setAuthBootstrapped(state, action: PayloadAction<boolean>) {
      state.bootstrapped = action.payload;
    }
  }
});

export const { setUser, setAuthBootstrapped } = authSlice.actions;
export const authReducer = authSlice.reducer;
