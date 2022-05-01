import { showError } from "@/lib/toasts";
import { PlayerState } from "@/redux/slices/player";
import { newGame } from "@/redux/thunks/game";
import { getPlayerState } from "@/redux/thunks/player";
import { useAppDispatch, useAppSelector } from "@/store";
import { Game } from "@api/generated/API";
import { useNavigate } from "react-router-dom";

export const OutOfGameControls = () => {
  const dispatch = useAppDispatch();
  const creatingGame = useAppSelector((state) => state.game.pending);
  const navigate = useNavigate();

  return (
    <div className="control-buttons">
      <button
        onClick={async () => {
          const playerState = (await dispatch(getPlayerState())).payload as PlayerState;
          const { credentials } = playerState;
          if (credentials) {
            const game = (await dispatch(newGame({ token: credentials.token }))).payload as Game;
            navigate(`/game/${game.id}`);
          } else {
            showError("Failed to fetch credentials.");
          }
        }}
        className={`button ${creatingGame ? "is-loading" : ""}`}
      >
        New Game
      </button>
    </div>
  );
};
