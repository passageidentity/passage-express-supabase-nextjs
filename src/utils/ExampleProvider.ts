import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

export interface ExampleProfile extends Record<string, any> {
  sub: string;
}

export default function ExampleProvider<P extends ExampleProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "example",
    name: "Example",
    wellKnown: `${options.issuer}/.well-known/openid-configuration`,
    type: "oauth",
    authorization: { params: { scope: "openid email profile" } },
    checks: ["pkce", "state"],
    idToken: true,
    userinfo: `${options.issuer}/userinfo`,
    profile(profile: any, tokens: any) {
      console.log("profile", profile, tokens);
      return {
        id: profile.sub,
      };
    },
    options,
  };
}
