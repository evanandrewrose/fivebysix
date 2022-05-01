* `schema.graphql` is our manually maintained graphql schema.
* `.graphqlconfig.yml` was generated once by `amplify add codegen`.
* `amplify-cli` is used to generate query strings in `generated/graphql/*.ts`.
* `codegen.yml` is for graphql-codegen, which generates API.ts.
  * We use graphql-codegen instead of amplify for API.ts because it allows us to skip the
    __typename definitions, which we don't need or want.
* Everything in `generated` is indeed generated (and not to be checked in).
* `_aws.graphql` is just for our IDEs to find type definitions for aws-specific declaratives.
* Run `npm i && npm run generate` to generate API definitions.
