import { GuessResponse } from "@api/generated/API";
import { getPreviousGuesses, makeGuess, newConsecutiveGame } from "@/redux/thunks/game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { gameActions } from "@/redux/slices/game";

interface InputGridState {
  guesses: GuessResponse[];
  currentInput: string;
  guessRejected: boolean;
  guessPending: boolean;
  focused: boolean;
}

const initialState: InputGridState = {
  guesses: [],
  currentInput: "",
  guessRejected: false,
  guessPending: false,
  focused: true,
};

export const inputGridSlice = createSlice({
  name: "inputGrid",
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<GuessResponse[]>) => {
      state.currentInput = "";
      state.guesses = action.payload;
    },
    blur: (state) => {
      state.focused = false;
    },
    focus: (state) => {
      state.focused = true;
    },
    addCharacterInput: (state, action: PayloadAction<string>) => {
      if (state.currentInput.length < 5 && state.focused) {
        state.currentInput += action.payload;
        state.guessRejected = false;
      }
    },
    removeCharacterInput: (state) => {
      if (state.currentInput.length > 0 && state.focused) {
        state.currentInput = state.currentInput.slice(0, state.currentInput.length - 1);
        state.guessRejected = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPreviousGuesses.fulfilled, (state, action) => {
        state.guesses = action.payload;
      })
      .addCase(makeGuess.pending, (state, action) => {
        state.guessPending = true;
      })
      .addCase(makeGuess.fulfilled, (state, action) => {
        state.guesses.push(action.payload);
        state.currentInput = "";
        state.guessRejected = false;
        state.guessPending = false;
      })
      .addCase(makeGuess.rejected, (state) => {
        state.guessRejected = true;
        state.guessPending = false;
      })
      .addCase(newConsecutiveGame.fulfilled, (state) => {
        state.currentInput = "";
        state.guesses = [];
        state.guessPending = false;
        state.guessRejected = false;
      })
      .addCase(gameActions.leaveGame, (state) => {
        state.currentInput = "";
        state.guesses = [];
        state.guessPending = false;
        state.guessRejected = false;
      });
  },
});

export const inputGridActions = inputGridSlice.actions;

export default inputGridSlice.reducer;
