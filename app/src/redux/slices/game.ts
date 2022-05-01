import { Game } from "@api/generated/API";
import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { getGameState, newGame, setReady, joinGame, newConsecutiveGame } from "@/redux/thunks/game";

interface GameState {
  game: Game | null;
  pending: boolean;
  readyPending: boolean;
}

const initialState: GameState = {
  game: null,
  pending: false,
  readyPending: false,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    leaveGame: (state) => {
      state.game = null;
      state.pending = false;
      state.readyPending = false;
    },
    updateGame: (state, action: PayloadAction<Game>) => {
      state.game = action.payload;
      state.pending = false;
    },
    updatePlayerName: (
      state,
      action: PayloadAction<{
        id: string;
        name?: string | null;
      }>
    ) => {
      const player = state.game?.playerStates.find((player) => player.player.id === action.payload.id)?.player;
      if (player) {
        player.name = action.payload.name;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setReady.pending, (state) => {
        state.readyPending = true;
      })
      .addCase(setReady.rejected, (state) => {
        state.readyPending = false;
      })
      .addCase(setReady.fulfilled, (state, action) => {
        state.readyPending = false;
        state.game = action.payload;
      })
      .addMatcher(
        isAnyOf(newGame.rejected, getGameState.rejected, newConsecutiveGame.rejected, joinGame.rejected),
        (state) => {
          state.pending = false;
        }
      )
      .addMatcher(
        isAnyOf(newGame.pending, getGameState.pending, newConsecutiveGame.pending, joinGame.pending),
        (state) => {
          state.pending = true;
        }
      )
      .addMatcher(
        isAnyOf(newConsecutiveGame.fulfilled, joinGame.fulfilled, newGame.fulfilled, getGameState.fulfilled),
        (state, action) => {
          state.game = action.payload;
          state.pending = false;
        }
      );
  },
});

export const gameActions = gameSlice.actions;

export default gameSlice.reducer;
