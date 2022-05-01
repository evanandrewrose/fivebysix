import { showError } from "@/lib/toasts";
import { classNames } from "@/lib/util";
import { inputGridActions } from "@/redux/slices/inputGrid";
import { PlayerState } from "@/redux/slices/player";
import { getPlayerCachedName, getPlayerState, setName } from "@/redux/thunks/player";
import { useAppDispatch, useAppSelector } from "@/store";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";

const nameRegex = "^[A-Za-z-0-9]{0,12}$";

export const NameInput = () => {
  const dispatch = useAppDispatch();

  const player = useAppSelector((state) => state.player);
  const { name } = player;

  const [inputValue, setInputValue] = useState(name ?? "");
  const [animatedSuccess, setAnimatedSuccess] = useState(false);
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    // todo: this should be done through redux state instead
    setInputValue(getPlayerCachedName() ?? "");
  }, []);

  const applyNameChange = useRef(
    debounce(async (value) => {
      if (!value.match(nameRegex) || value.length <= 0) {
        return;
      }

      const playerState = (await dispatch(getPlayerState())).payload as PlayerState;
      const { credentials } = playerState;

      if (credentials) {
        const result = await dispatch(
          setName({
            name: value,
            token: credentials.token,
          })
        );

        if ("error" in result) {
          showError(`Failed to set name: ${result.error.message}`);
        } else {
          setAnimatedSuccess(true);
          setTimeout(() => {
            setAnimatedSuccess(false);
            setAccepted(true);
          }, 300);
        }
      } else {
        showError("Failed to fetch credentials.");
      }
    }, 1000)
  );

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input
        minLength={1}
        maxLength={12}
        onFocus={() => {
          dispatch(inputGridActions.blur());
        }}
        onBlur={() => {
          dispatch(inputGridActions.focus());
        }}
        pattern={nameRegex}
        className={classNames("name-input", animatedSuccess && "glow-accepted", accepted && inputValue && "accepted")}
        placeholder="guest"
        value={inputValue}
        onChange={async (e) => {
          setAccepted(false);
          applyNameChange.current(e.target.value);
          setInputValue(e.target.value);
        }}
      />
    </form>
  );
};
