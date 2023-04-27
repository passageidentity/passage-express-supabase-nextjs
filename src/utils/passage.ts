import { Passage, TokenStore, authResult } from '@passageidentity/passage-js'
import { getSession, signIn } from "next-auth/react"
import router from 'next/router';

if (!process.env.NEXT_PUBLIC_PASSAGE_APP_ID)
  throw new Error('NEXT_PUBLIC_PASSAGE_APP_ID is not defined');

export class PassageTokenStore extends TokenStore {
  async setTokens(authResult: authResult): Promise<void> {
    signIn("passage", {
      redirect: true,
      authToken: authResult.auth_token,
      callbackUrl: router.query.callbackUrl as string,
    })
  }

  getAuthToken() {
    return getSession().then((session) => {
      return Promise.resolve(session!.supabaseAccessToken ?? '');
    });
  }
};

export const passage = new Passage(process.env.NEXT_PUBLIC_PASSAGE_APP_ID, { tokenStore: new PassageTokenStore() });
export const passageCurrentUser = passage.getCurrentUser()
