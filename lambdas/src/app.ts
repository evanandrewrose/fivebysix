import { resolver as createGameResolver } from "@/src/resolvers/game/createGame";
import { resolver as getGameResolver } from "@/src/resolvers/game/getGame";
import { resolver as getGuesses } from "@/src/resolvers/game/getGuesses";
import { resolver as guessResolver } from "@/src/resolvers/game/guess";
import { resolver as joinGameResolver } from "@/src/resolvers/game/joinGame";
import { resolver as setPlayerReadyResolver } from "@/src/resolvers/game/setPlayerReady";
import { resolver as createPlayerResolver } from "@/src/resolvers/player/createPlayer";
import { resolver as getPlayerResolver } from "@/src/resolvers/player/getPlayer";
import { resolver as setPlayerNameResolver } from "@/src/resolvers/player/setPlayerName";
import { AppSyncResolverHandler } from "aws-lambda";

export const resolvers = [
  getGameResolver,
  getPlayerResolver,
  createGameResolver,
  createPlayerResolver,
  joinGameResolver,
  setPlayerReadyResolver,
  setPlayerNameResolver,
  guessResolver,
  getGuesses,
];

export type AppHandler<TArgs, TResult> = AppSyncResolverHandler<TArgs, TResult> & { field: string };

export type ResolverTypes = typeof resolvers[number];

class AppsyncApp {
  resolvers: Record<string, ResolverTypes> = {};

  register = (resolver: ResolverTypes, name: string) => {
    this.resolvers[name] = resolver;
  };
}

export const App = new AppsyncApp();
