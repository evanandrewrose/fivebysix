export enum KeyType {
  A = "KeyA",
  B = "KeyB",
  C = "KeyC",
  D = "KeyD",
  E = "KeyE",
  F = "KeyF",
  G = "KeyG",
  H = "KeyH",
  I = "KeyI",
  J = "KeyJ",
  K = "KeyK",
  L = "KeyL",
  M = "KeyM",
  N = "KeyN",
  O = "KeyO",
  P = "KeyP",
  Q = "KeyQ",
  R = "KeyR",
  S = "KeyS",
  T = "KeyT",
  U = "KeyU",
  V = "KeyV",
  W = "KeyW",
  X = "KeyX",
  Y = "KeyY",
  Z = "KeyZ",

  Enter = "Enter",
  Backspace = "Backspace",

  Unknown = "__unknown",
}

export class Key {
  private code: string;

  get type(): KeyType {
    if (this.isCharacter()) {
      // eslint-disable-next-line
      return (KeyType as any)[this.asCharacter()] ?? KeyType.Unknown;
    }
    // eslint-disable-next-line
    return (KeyType as any)[this.code] ?? KeyType.Unknown;
  }

  static isCharacter = (code: string) => /^Key[A-Z]$/.test(code);

  static characterFromCode = (code: string) => {
    if (!this.isCharacter(code)) {
      throw new Error("Attempted to convert non-character key as character.");
    }

    return code.charAt(code.length - 1).toUpperCase();
  };

  constructor(code: string) {
    this.code = code;
  }

  isCharacter = () => Key.isCharacter(this.code);
  isRecognized = () => this.type !== KeyType.Unknown;
  isEnter = () => this.type === KeyType.Enter;
  isBackspace = () => this.type === KeyType.Backspace;
  asCharacter = () => Key.characterFromCode(this.code);
}
