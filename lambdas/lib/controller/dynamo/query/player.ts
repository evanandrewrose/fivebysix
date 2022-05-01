import { SafeDocumentClient } from "@/lib/clients/dynamo";
import {
  PlayerEntities,
  PlayerEntity,
  PlayerEntityPK,
  PlayerEntitySK,
  PlayerTokenEntity,
  PlayerTokenEntityPK,
} from "@/lib/controller/dynamo/model";
import { environment as env } from "@/lib/environment";
import { GetItemInput } from "aws-sdk/clients/dynamodb";

export interface GetPlayerProps {
  id: string;
}

export type GetPlayerEntityOptions = Omit<GetItemInput, "TableName" | "Key">;

export const getPlayerEntity = async (
  client: SafeDocumentClient,
  props: GetPlayerProps
): Promise<PlayerEntity> => {
  const key: PlayerEntityPK = `PLAYER#${props.id}`;

  const result = await client
    .get({
      TableName: env().table,
      Key: {
        pk: key,
        sk: key,
      },
    })
    .promise();

  if (result.Item === undefined) {
    throw new Error(`Player not found.`);
  }

  return result.Item;
};

export interface GetPlayerEntitiesProps {
  ids: string[];
}
export const getPlayerEntities = async (
  client: SafeDocumentClient,
  props: GetPlayerEntitiesProps
): Promise<PlayerEntities> => {
  const result = await client
    .batchGet({
      RequestItems: {
        [env().table]: {
          Keys: props.ids.map((id) => ({
            pk: `PLAYER#${id}`,
            sk: `PLAYER#${id}`,
          })),
        },
      },
    })
    .promise();

  return result.Responses![env().table] as PlayerEntities;
};

export interface PutPlayerEntityProps {
  id: string;
  token: string;
}

export const putPlayerEntity = async (
  client: SafeDocumentClient,
  props: PutPlayerEntityProps
): Promise<{
  playerEntity: PlayerEntity;
  tokenEntity: PlayerTokenEntity;
}> => {
  const playerKey: PlayerEntityPK = `PLAYER#${props.id}`;

  const playerEntity: PlayerEntity = {
    pk: playerKey,
    sk: playerKey,
    token: props.token,
    id: props.id,
  };

  const tokenKey: PlayerTokenEntityPK = `PLAYERTOKEN#${props.token}`;

  const tokenEntity: PlayerTokenEntity = {
    pk: tokenKey,
    sk: tokenKey,
    player: props.id,
    token: props.token,
  };

  await client
    .batchWrite({
      RequestItems: {
        [env().table]: [
          {
            PutRequest: {
              Item: playerEntity,
            },
          },
          {
            PutRequest: {
              Item: tokenEntity,
            },
          },
        ],
      },
    })
    .promise();

  return {
    playerEntity,
    tokenEntity,
  };
};

interface UpdatePlayerNameProps {
  id: string;
  name: string;
}

export const updatePlayerName = async (
  client: SafeDocumentClient,
  props: UpdatePlayerNameProps
): Promise<PlayerEntity> => {
  const pk: PlayerEntityPK = `PLAYER#${props.id}`;
  const sk: PlayerEntitySK = pk;

  const result = await client
    .update({
      TableName: env().table,
      Key: {
        pk,
        sk,
      },
      UpdateExpression: "SET #key = :playerName",
      ExpressionAttributeNames: {
        "#key": "name",
      },
      ExpressionAttributeValues: {
        ":playerName": props.name,
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();

  return result.Attributes!;
};
