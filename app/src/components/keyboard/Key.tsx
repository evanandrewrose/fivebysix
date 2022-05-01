import { Key, KeyType } from "@/lib/keyEvent";
import { classNames } from "@/lib/util";
import { get } from "lodash";
import { CSSProperties } from "react";

interface KeyLabelProps {
  keyInstance: Key;
}

export const KeyLabel = (props: KeyLabelProps) =>
  get(
    {
      [KeyType.Backspace]: <span className="wide">{"Back"}</span>,
      [KeyType.Enter]: <span className="wide">{"Enter"}</span>,
    },
    props.keyInstance.type,
    <span>{props.keyInstance.isCharacter() && props.keyInstance.asCharacter()}</span>
  );

const keyClassesFromKey = (key: Key) =>
  get(
    {
      [KeyType.Enter]: "enter",
      [KeyType.Backspace]: "back",
    },
    key.type,
    "character"
  );

interface KeyboardKeyProps {
  style: CSSProperties;
  className: string;
  keyInstance: Key;
  down?: boolean;
  onClick?: (key: Key) => void;
}

export const KeyboardKey: React.FC<KeyboardKeyProps> = (props) => (
  <button
    style={props.style}
    className={classNames(
      "key",
      props.down && "down",
      "remove-focus-theme",
      keyClassesFromKey(props.keyInstance),
      props.className
    )}
    onClick={() => props.onClick && props.onClick(props.keyInstance)}
  >
    <KeyLabel keyInstance={props.keyInstance} />
  </button>
);
