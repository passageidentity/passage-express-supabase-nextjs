import ExampleProvider from "@/utils/ExampleProvider";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import CognitoProvider from "next-auth/providers/cognito";
import PassageProvider from "@/utils/PassageProvider";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");

if (!process.env.SUPABASE_JWT_SECRET)
  throw new Error("SUPABASE_JWT_SECRET is not defined");

const getUser = async (filters: any) => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY === undefined) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: { schema: "next_auth" },
    }
  );

  if (!filters) {
    throw new Error("Missing filters");
  }

  let user = null;

  if (filters.email && filters.password) {
    let { data, error } = await supabase
      .from("users")
      .select()
      .match({ email: filters.email, encrypted_password: filters.password })
      .single();

    if (error) {
      return null;
    }

    user = data;
  }

  if (filters.id) {
    let { data, error } = await supabase
      .from("users")
      .select()
      .match({ id: filters.id })
      .single();

    if (error) {
      return null;
    }

    user = data;
  }

  return user;
};

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    PassageProvider({
      clientId: "6GEkPlFgSGJmsTdH7flISr4L",
      clientSecret: "123",
      issuer: "https://michaeloidc.passage.dev",
    }),
    ExampleProvider({
      clientId: "native",
      clientSecret: "secret",
      issuer: "http://localhost:9998",
    }),
    CognitoProvider({
      clientId: "3o26s90s5dgqoap25mmq9hcbbu",
      clientSecret: "1g01o2jlbbcfvo488julb61bhpk0qov50manc3d62lp4ppc533ll",
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_x6T8hZX2c",
    }),
  ],
  callbacks: {
    // async signIn() {
    //   return true;
    // },
    async jwt({ token, user }) {
      console.log("jwt", token, user);
      return { ...token, ...user };
    },
    async session({ session, token }) {
      console.log("session", session, token);

      token.id = "a34197ef-8b59-4661-a25e-ce97180585b2";

      const user = await getUser({ id: token.id });

      if (!user) throw new Error("Missing user");

      const signingSecret = process.env.SUPABASE_JWT_SECRET;
      if (signingSecret) {
        const payload = {
          aud: "authenticated",
          exp: Math.floor(new Date(session.expires).getTime() / 1000),
          sub: token.id,
          email: user.email,
          role: "authenticated",
        };
        session.supabaseAccessToken = jwt.sign(payload, signingSecret);
      }

      session.user.id = token.sub || "";
      session.user.name = user.name || "";
      session.user.email = user.email || "";

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
