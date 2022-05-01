import { showError } from "@/lib/toasts";
import { unwrapGame, unwrapPlayerCredential } from "@/redux/selectors";
import { gameActions } from "@/redux/slices/game";
import { newConsecutiveGame } from "@/redux/thunks/game";
import { useAppDispatch, useAppSelector } from "@/store";
import { Game, GameState } from "@api/generated/API";
import React from "react";
import { useNavigate } from "react-router-dom";

export const InGameControls = () => {
  const game = useAppSelector(unwrapGame);
  const { token } = useAppSelector(unwrapPlayerCredential);
  const { id: gameId, state: gameState } = game;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const gameOver = gameState === GameState.Finished;

  return (
    <div className="button-group-stack">
      <div className="control-buttons">
        {gameOver && (
          <React.Fragment>
            <button
              className="button is-dark"
              onClick={async () => {
                dispatch(gameActions.leaveGame());
                navigate(`/`);
              }}
            >
              <span className="icon">
                <i className="fa fa-home"></i>
              </span>
              <span>Home</span>
            </button>
            <button
              className="button is-success"
              onClick={async () => {
                gameActions.leaveGame();

                try {
                  const game = (
                    await dispatch(
                      newConsecutiveGame({
                        token,
                        previousGameId: gameId,
                      })
                    )
                  ).payload as Game;

                  navigate(`/game/${game.id}`);
                } catch {
                  showError("Failed to create or join the next game. Maybe they started without you?");
                }
              }}
            >
              <span className="icon">
                <i className="fa fa-arrow-right"></i>
              </span>
              <span>Next Game</span>
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
