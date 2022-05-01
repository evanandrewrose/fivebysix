import { gameActions } from "@/redux/slices/game";
import { NameInput } from "@/components/header/NameInput";
import { HowToButton } from "@/components/header/HowToButton";
import { useAppDispatch } from "@/store";
import { useNavigate } from "react-router";

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div id="header">
      <div className="header-left">
        <button
          className="button is-rounded"
          onClick={() => {
            navigate("/");
            dispatch(gameActions.leaveGame());
          }}
        >
          <span className="icon">
            <i className="fa fa-home"></i>
          </span>
        </button>
      </div>
      <span className="header-center">
        <h1 className="title is-4 block">Welcome,&nbsp;</h1>
        <NameInput />
      </span>
      <div className="header-right">
        <HowToButton />
      </div>
    </div>
  );
};
