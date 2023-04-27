import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const verifyCsrfToken = (token: string) => {
  // TODO: verify csrf token
  return true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // get the email and password from the request body
  const { email, password, name, csrfToken } = req.body

  // do some validation on the email and password
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, Email, and Password are required!' })
  }

  if (verifyCsrfToken(csrfToken) === false) {
    return res.status(400).json({ message: 'CSRF token is invalid!' })
  }  

  if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
    return res.status(500).json({ message: 'NEXT_PUBLIC_SUPABASE_URL is not defined' })
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY === undefined) {
    return res.status(500).json({ message: 'SUPABASE_SERVICE_ROLE_KEY is not defined' })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: { schema: "next_auth" },
  })

  // create a new user in supabase.users
  let { data, error } = await supabase
  .from("users")
  .insert({ 
    name: name,
    email: email,
    encrypted_password: password,
   })
  .select()
  .single();

  if (error) {
    return res.status(400).json({ message: error.message })
  }

  res.status(200).json({ message: 'Sign up successful!' })
}