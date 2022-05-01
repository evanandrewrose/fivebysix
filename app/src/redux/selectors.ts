import { AppState } from "@/store";
import { GameState } from "@api/generated/API";

export const selectGameState = (state: AppState) => {
  return state.game;
};

export const unwrapGame = (state: AppState) => {
  return state.game.game!;
};

export const selectGame = (state: AppState) => {
  return state.game.game;
};

export const unwrapPlayerCredential = (state: AppState) => {
  return state.player.credentials!;
};

export const unwrapPlayerId = (state: AppState) => {
  return state.player.credentials!.id;
};

export const selectPlayerCredentials = (state: AppState) => {
  return state.player.credentials;
};

export const selectPlayerId = (state: AppState) => {
  return state.player.credentials?.id;
};

export const selectInputGrid = (state: AppState) => state.inputGrid;

export const selectGameIsOngoing = (state: AppState) => {
  return state.game.game && state.game.game?.state === GameState.Ongoing;
};
