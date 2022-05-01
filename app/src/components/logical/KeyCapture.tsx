import { AppDispatch, useAppSelector } from "@/store";
import { useDispatch } from "react-redux";
import { inputGridActions } from "@/redux/slices/inputGrid";
import { keyboardActions } from "@/redux/slices/keyBoard";
import { makeGuess } from "@/redux/thunks/game";
import { Key } from "@/lib/keyEvent";
import React, { useEffect } from "react";
import { selectGameIsOngoing } from "@/redux/selectors";

export const KeyCapture: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameIsOngoing = useAppSelector(selectGameIsOngoing);

  const keyDownListener = (e: KeyboardEvent) => {
    const key = new Key(e.code);
    if (key.isCharacter() && (!e.ctrlKey || e.metaKey || e.altKey) && gameIsOngoing) {
      dispatch(inputGridActions.addCharacterInput(key.asCharacter()));
    }
    if (key.isRecognized()) {
      dispatch(keyboardActions.keyDown(key.type));
    }
    if (key.isEnter() && gameIsOngoing) {
      dispatch(makeGuess());
    }
  };

  const keyUpListener = (e: KeyboardEvent) => {
    const key = new Key(e.code);
    if (key.isBackspace() && gameIsOngoing) {
      dispatch(inputGridActions.removeCharacterInput());
    }
    if (key.isRecognized()) {
      dispatch(keyboardActions.keyUp(key.type));
    }
  };

  const blurListener = (e: FocusEvent) => {
    dispatch(keyboardActions.allKeysUp());
  };

  useEffect(() => {
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    window.addEventListener("blur", blurListener);

    return () => {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
      window.removeEventListener("blur", blurListener);
    };
  });

  return <React.Fragment />;
};
