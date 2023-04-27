import { createClient } from "@supabase/supabase-js"
import { Database } from "@/../types/supabase";

export const supabase = (token?: string) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not defined. Please add it to your .env.local"
    )

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please add it to your .env.local"
    )

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
  )
}