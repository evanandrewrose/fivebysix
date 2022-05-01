import { InGameControls } from "@/components/game/controller/InGameControls";
import { OutOfGameControls } from "@/components/game/controller/OutOfGameControls";
import { selectGame, selectPlayerId } from "@/redux/selectors";
import { useAppSelector } from "@/store";

export const Controller = () => {
  const game = useAppSelector(selectGame);
  const player = useAppSelector(selectPlayerId);

  const inGame = game && player;

  return inGame ? <InGameControls /> : <OutOfGameControls />;
};
