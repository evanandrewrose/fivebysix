export const millisecondsInDay = 1000 * 60 * 60 * 24;

export const dateToMilliseconds = (d: Date) => +d;

export const dateToSeconds = (d: Date) => Math.floor(dateToMilliseconds(d) / 1000);

export const dateFromMilliseconds = (ms: number) => new Date(ms);

export const tomorrow = () =>
  dateFromMilliseconds(dateToMilliseconds(new Date()) + millisecondsInDay);
