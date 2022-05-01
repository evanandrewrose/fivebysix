# dependencies:
# aws cli: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
# amplify cli: npm install -g @aws-amplify/cli
APP_NAME="WwApi"

mkdir -p generated

aws appsync get-introspection-schema \
  --api-id \
  "$(aws appsync list-graphql-apis | jq -r ".graphqlApis[] | select(.name == \"${APP_NAME}\") | .apiId")" \
  --format JSON \
  ./generated/schema.json

# amplify codegen
