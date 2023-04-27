# Todo example using Passage with Supabase, Nextjs and Auth.js

- Frontend:
  - [Passage](https://passage.id) - a passwordless authentication platform.
  - [Next.js](https://github.com/vercel/next.js) - a React framework for production.
  - [Auth.js](https://authjs.dev/) - Authentication for the web.
  - [Tailwind](https://tailwindcss.com/) for styling and layout.
  - [Supabase.js](https://supabase.com/docs/library/getting-started) for user management and realtime data syncing.
- Backend:
  - [app.supabase.com](https://app.supabase.com/): hosted Postgres database with restful API for usage with Supabase.js.

## Build from scratch

### 1. Create new project

Sign up to Supabase - [https://app.supabase.com](https://app.supabase.com) and create a new project. Wait for your database to start.

### 2. Get the URL, Anon Key and JWT Secret

Go to the Project Settings (the cog icon), open the API tab, and find your API URL and `anon` key, you'll need these in the next step.

The `anon` key is your client-side API key. It allows "anonymous access" to your database, until the user has logged in. Once they have logged in, the keys will switch to the user's own login token. This enables row level security for your data. Read more about this [below](#postgres-row-level-security).

![image](https://user-images.githubusercontent.com/10214025/88916245-528c2680-d298-11ea-8a71-708f93e1ce4f.png)

**_NOTE_**: The `service_role` key has full access to your data, bypassing any security policies. These keys have to be kept secret and are meant to be used in server environments and never on a client or browser.

### 4. Setup the Auth.JS Schema

Inside of your project, enter the `SQL editor` tab and execute the authjs-schema.sql to load the next_auth schema.

expose the next_auth schema within the API settings found [here](https://app.supabase.com/project/_/settings/api).

### 3. Setup Database Schema

Inside of your project, enter the `SQL editor` tab and execute the schema.sql to load the todos schema

## Authors

- [Supabase](https://supabase.com)
- [Passage](https://passage.id)