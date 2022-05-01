import game from "@/redux/slices/game";
import inputGrid from "@/redux/slices/inputGrid";
import keyboard from "@/redux/slices/keyBoard";
import player from "@/redux/slices/player";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { enableMapSet } from "immer";

enableMapSet();

const store = configureStore({
  reducer: {
    inputGrid,
    keyboard,
    player,
    game,
  },
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
