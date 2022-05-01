import { client } from "@/client";
import { showError } from "@/lib/toasts";
import { Game, UpdatedGameSubscription, UpdatedGameSubscriptionVariables } from "@api/generated/API";
import { updatedGame } from "@api/generated/graphql/subscriptions";
import { FetchResult, gql } from "@apollo/client/core";
import retry from "retry";
import { Subscription } from "zen-observable-ts";

export class GameStateSubscriptionManager {
  subscription: Subscription | null = null;
  gameId: string | null = null;

  // Somehow, our subscription handler sometimes gets freed by our zen observable
  // if we don't keep a reference to it ourselves?
  static onSubscriptionErrorCreator = (operation: retry.RetryOperation) => (error: Error) => {
    if (!operation.retry(error)) {
      showError(error);
    }
  };

  onSubscriptionError?: ReturnType<typeof GameStateSubscriptionManager.onSubscriptionErrorCreator>;

  subscribeToGameState = async (gameId: string, onUpdate: (gameState: Game) => void) => {
    if (this.subscription) {
      return;
    }

    // It seems that appsync sometimes randomly closes our subscription? Retrying 2 more times seems to mitigate.
    const operation = retry.operation({
      retries: 2,
      randomize: true,
    });

    this.onSubscriptionError = GameStateSubscriptionManager.onSubscriptionErrorCreator(operation);

    operation.attempt(() => {
      const observable = client.subscribe<UpdatedGameSubscription, UpdatedGameSubscriptionVariables>({
        errorPolicy: "all",
        fetchPolicy: "no-cache",
        query: gql(updatedGame),
        variables: {
          id: gameId,
        },
      });

      this.onSubscriptionError = GameStateSubscriptionManager.onSubscriptionErrorCreator(operation);

      this.subscription = observable.subscribe((result: FetchResult<UpdatedGameSubscription>) => {
        if (result.data?.updatedGame) {
          onUpdate(result.data.updatedGame);
        }
      }, this.onSubscriptionError);
    });
  };

  unsubscribe = () => {
    this.subscription?.unsubscribe();
    this.subscription = null;
  };
}
