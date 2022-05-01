import { environment } from "@/lib/environment";
import { InMemoryCache } from "@apollo/client/cache";
import { ApolloClient, ApolloLink, HttpLink } from "@apollo/client/core";
import { createAuthLink } from "aws-appsync-auth-link";
import fetch from "cross-fetch";

const api = process.env.API_ENDPOINT!;

const link = ApolloLink.from([
  createAuthLink({
    url: api,
    region: environment().region,
    auth: {
      type: "AWS_IAM",
      credentials: {
        accessKeyId: environment().accessKeyId,
        secretAccessKey: environment().secretAccessKey,
        sessionToken: environment().sessionToken,
      },
    },
  }),
  new HttpLink({
    uri: api,
    fetch,
  }),
]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
