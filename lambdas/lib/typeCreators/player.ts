import { PlayerEntities } from "@/lib/controller/dynamo/model";

export const createPlayerIdToNameMapping = (players: PlayerEntities) =>
  players.reduce<Record<string, string | null>>((prev, player) => {
    const id = player.pk.slice("PLAYER#".length);
    prev[id] = player.name ?? null;
    return prev;
  }, {});
