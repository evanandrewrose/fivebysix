export type GameEntityPK<ID extends string = string> = `GAME#${ID}`;
export type GameEntitySK = GameEntityPK;

export type GameEntityPlayer = {
  guesses: string[];
};

export type GameEntityPlayerMap = Record<string, GameEntityPlayer>;

export interface GameEntity {
  pk: GameEntityPK;
  sk: GameEntitySK;
  players: GameEntityPlayerMap;
  readyPlayerIds: string[];
  host: string;
  id: string;
  word: string;
  ttl: number;
}

export type PlayerTokenEntityPK<ID extends string = string> = `PLAYERTOKEN#${ID}`;
export type PlayerTokenEntitySK = PlayerTokenEntityPK;

export interface PlayerTokenEntity {
  pk: PlayerTokenEntityPK;
  sk: PlayerTokenEntitySK;
  token: string;
  player: string;
}

export type PlayerEntityPK<ID extends string = string> = `PLAYER#${ID}`;
export type PlayerEntitySK = PlayerEntityPK;

export interface PlayerEntity {
  pk: PlayerEntityPK;
  sk: PlayerEntitySK;
  id: string;
  name?: string;
  token: string;
}

export type Entity = PlayerEntity | PlayerTokenEntity | GameEntity;

export type PlayerEntities = PlayerEntity[];
