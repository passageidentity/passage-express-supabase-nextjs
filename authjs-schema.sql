ALTER TABLE
    IF EXISTS ONLY next_auth.sessions DROP CONSTRAINT "sessions_userId_fkey";

ALTER TABLE
    IF EXISTS ONLY next_auth.accounts DROP CONSTRAINT "accounts_userId_fkey";

DROP TRIGGER IF EXISTS on_auth_user_created ON next_auth.users;

ALTER TABLE
    IF EXISTS ONLY next_auth.verification_tokens DROP CONSTRAINT verification_tokens_pkey;

ALTER TABLE
    IF EXISTS ONLY next_auth.users DROP CONSTRAINT users_pkey;

ALTER TABLE
    IF EXISTS ONLY next_auth.users DROP CONSTRAINT users_passage_id_key;

ALTER TABLE
    IF EXISTS ONLY next_auth.verification_tokens DROP CONSTRAINT token_identifier_unique;

ALTER TABLE
    IF EXISTS ONLY next_auth.sessions DROP CONSTRAINT sessiontoken_unique;

ALTER TABLE
    IF EXISTS ONLY next_auth.sessions DROP CONSTRAINT sessions_pkey;

ALTER TABLE
    IF EXISTS ONLY next_auth.accounts DROP CONSTRAINT provider_unique;

ALTER TABLE
    IF EXISTS ONLY next_auth.users DROP CONSTRAINT email_unique;

ALTER TABLE
    IF EXISTS ONLY next_auth.accounts DROP CONSTRAINT accounts_pkey;

DROP TABLE IF EXISTS next_auth.verification_tokens;

DROP TABLE IF EXISTS next_auth.users;

DROP TABLE IF EXISTS next_auth.sessions;

DROP TABLE IF EXISTS next_auth.accounts;

DROP SCHEMA IF EXISTS next_auth CASCADE;

--
-- Name: next_auth; Type: SCHEMA;
--
CREATE SCHEMA next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;

GRANT ALL ON SCHEMA next_auth TO postgres;

--
-- Create users table
--
CREATE TABLE IF NOT EXISTS next_auth.users (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text,
    email text,
    "emailVerified" timestamp with time zone,
    image text,
    encrypted_password text,
    passage_id text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email),
    CONSTRAINT users_passage_id_key UNIQUE (passage_id)
);

GRANT ALL ON TABLE next_auth.users TO postgres;

GRANT ALL ON TABLE next_auth.users TO service_role;

--- uid() function to be used in RLS policies
CREATE FUNCTION next_auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;

--
-- Create sessions table
--
CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    expires timestamp with time zone NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" uuid,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;

GRANT ALL ON TABLE next_auth.sessions TO service_role;

--
-- Create accounts table
--
CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    oauth_token_secret text,
    oauth_token text,
    "userId" uuid,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;

GRANT ALL ON TABLE next_auth.accounts TO service_role;

--
-- Create verification_tokens table
--
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text,
    token text,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;

GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;