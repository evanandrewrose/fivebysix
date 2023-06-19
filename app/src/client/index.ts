import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client/core";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";

const api = "https://b3gapoedtrd4pipircckkxyqim.appsync-api.us-east-1.amazonaws.com/graphql";

const authLinkOptions: Parameters<typeof createAuthLink>[0] = {
  url: api,
  region: "us-east-1",
  auth: {
    type: "API_KEY",
    apiKey: "da2-lk3xo5fejnhfhoilbe34aexddy",
  },
};

const httpLink = new HttpLink({
  uri: api,
  fetch,
});

const link = ApolloLink.from([
  createAuthLink(authLinkOptions),
  createSubscriptionHandshakeLink(authLinkOptions, httpLink),
]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
