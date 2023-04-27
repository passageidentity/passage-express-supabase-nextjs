import type { RequestInternal } from "next-auth"
import type { CommonProviderOptions } from "@auth/core/providers"
import type { User, Awaitable } from "next-auth"
import Passage from "@passageidentity/passage-node";

export interface CredentialInput {
  label?: string
  type?: string
  value?: string
  placeholder?: string
}

export interface CredentialsConfig<
  C extends Record<string, CredentialInput> = Record<string, CredentialInput>
> extends CommonProviderOptions {
  type: "credentials"
  credentials: C
  authorize: (
    credentials: Record<keyof C, string> | undefined,
    req: Pick<RequestInternal, "body" | "query" | "headers" | "method">
  ) => Awaitable<User | null>
}

export type CredentialsProvider = <C extends Record<string, CredentialInput>>(
  options: Partial<CredentialsConfig<C>>
) => CredentialsConfig<C>

export type CredentialsProviderType = "Credentials"

type UserCredentialsConfig<C extends Record<string, CredentialInput>> = Partial<
  Omit<CredentialsConfig<C>, "options">
>

export default function Credentials<
  C extends Record<string, CredentialInput> = Record<string, CredentialInput>
>(options: UserCredentialsConfig<C>): CredentialsConfig<C> {
  return {
    id: "passage",
    name: "Passage",
    type: "credentials",
    credentials: {} as any,
    authorize: async (credentials, req) => {
      if (!credentials)
      throw new Error('credentials is not defined')

      if (!process.env.NEXT_PUBLIC_PASSAGE_APP_ID)
        throw new Error('NEXT_PUBLIC_PASSAGE_APP_ID is not defined')

      if (!process.env.PASSAGE_APP_SECRET)
        throw new Error('PASSAGE_APP_SECRET is not defined')

      let passage = new Passage({
        appID: process.env.NEXT_PUBLIC_PASSAGE_APP_ID,
        apiKey: process.env.PASSAGE_APP_SECRET,
      });

      const userID = await passage.validAuthToken(credentials.authToken);
      if (!userID) return null;
      
      const passageUser = await passage.user.get(userID);

      if (!passageUser) return null;

      return {
        id: passageUser.user_metadata!.supabase_id as string,
      }
    },
    // @ts-ignore
    options,
  }
}