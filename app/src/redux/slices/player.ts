import { createSlice } from "@reduxjs/toolkit";
import { getPlayerState, setName } from "@/redux/thunks/player";

interface PlayerCredentials {
  token: string;
  id: string;
}

export interface PlayerState {
  credentials: PlayerCredentials | null;
  name: string | null;
  pending: boolean;
}

const initialState: PlayerState = {
  credentials: null,
  name: null,
  pending: false,
};

export const playerSlice = createSlice({
  name: "keyboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPlayerState.pending, (state, action) => {
      state.pending = true;
    });
    builder.addCase(getPlayerState.fulfilled, (state, action) => {
      state.credentials = action.payload.credentials;
      state.name = action.payload.name;
      state.pending = false;
    });
    builder.addCase(setName.fulfilled, (state, action) => {
      state.name = action.payload.name || null;
    });
  },
});

export const playerActions = playerSlice.actions;

export default playerSlice.reducer;
