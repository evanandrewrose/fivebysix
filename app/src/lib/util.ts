export const classNames = (...names: (string | null | undefined | boolean)[]) => names.filter((name) => name).join(" ");
