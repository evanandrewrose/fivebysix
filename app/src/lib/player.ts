import { Player } from "@api/generated/API";

export const playerIdToGuestDisplayName = (id: string) => {
  const regex = /^.*(?<last4>[A-Za-z0-9]{4})$/;

  const groups = id.match(regex)?.groups;
  const lastFourOfId = groups ? groups["last4"] : "unknown";

  return `guest-${lastFourOfId}`;
};

export const playerDisplayName = (player: Player): string => {
  if (player.name) {
    return player.name;
  }

  return playerIdToGuestDisplayName(player.id);
};
