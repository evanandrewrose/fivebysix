import { client as appsyncClient } from "@/lib/clients/appsync";
import { mock } from "vitest-mock-extended";

export const client: typeof appsyncClient = mock();

export type MockAppsyncClient = typeof client;
