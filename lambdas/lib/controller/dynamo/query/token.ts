import { SafeDocumentClient } from "@/lib/clients/dynamo";
import { environment as env } from "@/lib/environment";
import { PlayerTokenEntity, PlayerTokenEntityPK } from "@/lib/controller/dynamo/model";

export interface GetPlayerTokenEntityProps {
  token: string;
}

export const getPlayerTokenEntity = async (
  client: SafeDocumentClient,
  props: GetPlayerTokenEntityProps
): Promise<PlayerTokenEntity> => {
  const result = await client
    .get({
      TableName: env().table,
      Key: {
        pk: `PLAYERTOKEN#${props.token}`,
        sk: `PLAYERTOKEN#${props.token}`,
      },
    })
    .promise();

  if (!result.Item) {
    throw new Error("Player token not found.");
  }

  return result.Item!;
};

export interface PutPlayerTokenEntityProps {
  token: string;
  player: string;
}

export const putPlayerTokenEntity = async (
  client: SafeDocumentClient,
  props: PutPlayerTokenEntityProps
): Promise<PlayerTokenEntity> => {
  const key: PlayerTokenEntityPK = `PLAYERTOKEN#${props.token}`;

  const entity = {
    pk: key,
    sk: key,
    player: props.player,
    token: props.token,
  };

  await client
    .put({
      TableName: env().table,
      Item: entity,
    })
    .promise();

  return entity;
};
