import Navbar from '@/sections/navbar';
import { useSession } from "next-auth/react"

export default function Layout({ children }: any) {
  const { data: session } = useSession()

  return (
    <>
      {session && <Navbar />}

      <main>{children}</main>
    </>
  )
}