import { App, resolvers, ResolverTypes } from "@/src/app";
import { Callback, Context } from "aws-lambda";

resolvers.forEach((resolver) => App.register(resolver, resolver.field));

type EventTypes = Parameters<ResolverTypes>[0];
type ReturnTypes = Awaited<ReturnType<ResolverTypes>>;

export const handler = async (
  event: EventTypes,
  context: Context,
  callback: Callback
): Promise<ReturnTypes> => {
  console.log(`Event: ${JSON.stringify(event)}`);

  const handler: ResolverTypes = (() => {
    console.log(`Looking for resolver ${event.info.fieldName}`);

    const resolver = App.resolvers[event.info.fieldName];

    if (resolver) {
      return resolver;
    }

    throw new Error(
      `Could not find resolver for field name ${event.info.fieldName}. We have: ${JSON.stringify(
        App.resolvers
      )}`
    );
  })();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(event as any, context, callback);
};
