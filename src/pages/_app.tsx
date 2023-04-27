import '@/styles/global.css'
import type { AppProps } from 'next/app'
import Layout from '@/sections/layout'
import { SessionProvider } from 'next-auth/react'
import type { Session } from "next-auth"

export default function App({ Component, pageProps: { session, ...pageProps }, }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider>
      <Layout>
          <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  ) 
}
