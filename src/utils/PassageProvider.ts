import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface PassageProfile extends Record<string, any> {
  sub: string;
}

export default function Passage<P extends PassageProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "passage",
    name: "Passage",
    wellKnown: `${options.issuer}/.well-known/openid-configuration`,
    type: "oauth",
    authorization: { params: { scope: "openid" } },
    checks: ["pkce", "state"],
    idToken: false,
    userinfo: {
      url: `${options.issuer}/userinfo`,
      async request(context) {
        return new Promise((resolve, reject) => {
          resolve({
            sub: "a34197ef-8b59-4661-a25e-ce97180585b2",
          });
        });
      },
    },
    profile(profile: any, tokens: any) {
      return {
        id: profile.sub,
      };
    },
    options,
  };
}
