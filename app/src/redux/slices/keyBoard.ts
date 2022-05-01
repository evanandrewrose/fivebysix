import { KeyType } from "@/lib/keyEvent";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { uniq, without } from "lodash";

interface KeyboardState {
  keysDown: KeyType[];
}

const initialState: KeyboardState = {
  keysDown: [],
};

export const keyboardSlice = createSlice({
  name: "keyboard",
  initialState,
  reducers: {
    keyDown: (state, action: PayloadAction<KeyType>) => {
      state.keysDown = uniq([...state.keysDown, action.payload]);
    },
    keyUp: (state, action: PayloadAction<KeyType>) => {
      state.keysDown = without(state.keysDown, action.payload);
    },
    allKeysUp: (state) => {
      state.keysDown = [];
    },
  },
});

export const keyboardActions = keyboardSlice.actions;

export default keyboardSlice.reducer;
