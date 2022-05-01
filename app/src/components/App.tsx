import { GameStateSubscriptionManager } from "@/client/observables/gameStateManager";
import { Controller } from "@/components/game/controller/Controller";
import { Board } from "@/components/game/Board";
import { GameLobbyOverlay } from "@/components/game/lobby/GameLobbyOverlay";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { KeyCapture } from "@/components/logical/KeyCapture";
import { PlayerLobbyNotifier } from "@/components/logical/notifications/PlayerLobbyNotifier";
import { PlayerMoveNotifier } from "@/components/logical/notifications/PlayerMoveNotifier";
import { Header } from "@/components/header/Header";
import { GameOverPrompt } from "@/components/modals/GameOver";
import { showError } from "@/lib/toasts";
import { selectGame, selectPlayerCredentials } from "@/redux/selectors";
import { gameActions } from "@/redux/slices/game";
import { getGameState, getPreviousGuesses, joinGame } from "@/redux/thunks/game";
import { getPlayerState } from "@/redux/thunks/player";
import { useAppDispatch, useAppSelector } from "@/store";
import { GameState } from "@api/generated/API";
import React, { FC, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: FC = () => {
  const dispatch = useAppDispatch();
  const game = useAppSelector(selectGame);
  const credentials = useAppSelector(selectPlayerCredentials);

  const { gameId: gameIdFromURL } = useParams();

  const playerStates = game?.playerStates;
  const weAreInThisGame = !!(credentials && playerStates?.find((player) => player.player.id === credentials.id));
  const gameId = game?.id;

  const managerRef = useRef(new GameStateSubscriptionManager());

  // update player state (grab/ensure credentials) if our url changes
  useEffect(() => {
    if (gameIdFromURL) {
      dispatch(getPlayerState());
    }
  }, [gameIdFromURL, dispatch]);

  // if our url changes and we have credentials, join the corresponding game
  useEffect(() => {
    if (gameIdFromURL && credentials) {
      const { token } = credentials;

      if (!game) {
        dispatch(
          getGameState({
            gameId: gameIdFromURL,
          })
        );
      } else if (!weAreInThisGame) {
        (async () => {
          const joinResult = await dispatch(
            joinGame({
              id: gameIdFromURL,
              token: token,
            })
          );

          if (joinResult.meta.requestStatus === "rejected") {
            showError("Failed to join game.");
          }
        })();
      }
    }
  }, [game, weAreInThisGame, credentials, gameIdFromURL, dispatch]);

  // if our game id changes, load our previous guesses (in case of user refresh)
  useEffect(() => {
    if (gameId && credentials) {
      dispatch(
        getPreviousGuesses({
          gameId: gameId,
          playerToken: credentials.token,
        })
      );
    }
  }, [gameId, credentials, dispatch]);

  // if our game id changes, subscribe to the game events
  useEffect(() => {
    const manager = managerRef.current;
    if (gameId && weAreInThisGame) {
      manager.subscribeToGameState(gameId, (gameState) => {
        dispatch(gameActions.updateGame(gameState));
      });

      return () => {
        manager.unsubscribe();
      };
    }
  }, [gameId, weAreInThisGame, dispatch]);

  const inGame = game && credentials;
  const inWaitingGame = inGame && game.state === GameState.Waiting;
  const inOngoingGame = inGame && game.state === GameState.Ongoing;
  const inFinishedGame = inGame && game.state === GameState.Finished;

  return (
    <React.Fragment>
      <KeyCapture />
      <div id="container">
        <Header />
        <Controller />
        {inOngoingGame && <PlayerMoveNotifier />}
        {inGame && <PlayerLobbyNotifier />}
        <Board />
        <Keyboard />
      </div>

      {inFinishedGame && <GameOverPrompt />}

      {inWaitingGame && <GameLobbyOverlay />}

      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        limit={1}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
      />
    </React.Fragment>
  );
};

export default App;
