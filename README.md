# fivebysix.com

A multiplayer, worlde-inspired web app.

## Demo

<img src='app/screen-shots/gameplay.gif' />

## Technologies

- 100% TypeScript (including IAC via CDK)
- Vite
- React / Redux
- AWS
  - AppSync
  - Dynamo
  - CDK
  - WAF
  - Lambda
  - S3 / CloudFront
  - ACM / R53
- Bulma

## Notes

- Does _not_ use an external authentication solution. Instead, players are given a token when they first create/join a game, which stays in local storage.
  - This app doesn't support user permanence, so the above is sufficient.
- Does _not_ use AWS Amplify and jumps through some hoops to avoid it.
- Does _not_ use VTL for AppSync resolvers because they're still pretty hard to write/test/debug.
- Uses a single lambda (many handlers) for resolving all GraphQL queries.

The usage of GraphQL in this project isn't idiomatic. Instead of having per-field resolvers, we just return the full
response shape. This works well for this particular project because the complexity is low and the user access patterns
were clearly defined up front. In exchange for these sins, we end up with a really trivial backend.
