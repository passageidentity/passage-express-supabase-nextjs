import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { passageCurrentUser, passage } from '@/utils/passage';
import { PassageDevice } from '@passageidentity/passage-js';
import Link from 'next/link';

export default function Devices() {
  const [hasPasskey, setHasPasskey] = useState(false);
  const [devices, setDevices] = useState<PassageDevice[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user.email) return

    passage.identifierExists(session.user.email).then((user) => {
      passage.getCredentialAvailable().then((getCredential) => {
        if (user.hasPasskey && getCredential.isAvailable) {
          setHasPasskey(true)
        }
      })
    })
  }, [session?.user.email]);

  const Device = ({ device }: { device: PassageDevice }) => {
    const lastSeenAt = new Date(device.last_login_at).toLocaleString()

    return (
      <li className="flex justify-between gap-x-6 py-5" key={device.id}>
        <div className="flex gap-x-4">

          <svg fill="none" viewBox="0 0 50 50" height="50" width="50">
            <path xmlns="http://www.w3.org/2000/svg" d="M21.875 25C27.0527 25 31.25 20.8027 31.25 15.625C31.25 10.4473 27.0527 6.25 21.875 6.25C16.6973 6.25 12.5 10.4473 12.5 15.625C12.5 20.8027 16.6973 25 21.875 25Z" fill="currentColor"></path>
            <path xmlns="http://www.w3.org/2000/svg" d="M46.875 24.9998C46.8796 23.6939 46.5334 22.4106 45.8724 21.2842C45.2115 20.1578 44.2602 19.2296 43.1179 18.5965C41.9756 17.9635 40.6843 17.6488 39.3788 17.6855C38.0733 17.7221 36.8017 18.1087 35.6967 18.8049C34.5917 19.501 33.694 20.4811 33.0973 21.6428C32.5006 22.8046 32.2269 24.1052 32.3047 25.4089C32.3825 26.7125 32.8091 27.9714 33.5398 29.0538C34.2704 30.1363 35.2784 31.0026 36.4584 31.5623V42.7082L39.5834 45.8332L44.7917 40.6248L41.6667 37.4998L44.7917 34.3748L42.2084 31.7915C43.5804 31.2621 44.7603 30.3302 45.5931 29.1181C46.4259 27.906 46.8728 26.4705 46.875 24.9998ZM39.5834 24.9998C39.1713 24.9998 38.7685 24.8777 38.4259 24.6487C38.0833 24.4198 37.8163 24.0944 37.6586 23.7138C37.5009 23.3331 37.4597 22.9142 37.5401 22.5101C37.6205 22.1059 37.8189 21.7347 38.1102 21.4434C38.4016 21.152 38.7728 20.9536 39.1769 20.8732C39.5811 20.7928 39.9999 20.8341 40.3806 20.9918C40.7613 21.1494 41.0867 21.4165 41.3156 21.7591C41.5445 22.1017 41.6667 22.5045 41.6667 22.9165C41.6667 23.469 41.4472 23.9989 41.0565 24.3896C40.6658 24.7803 40.1359 24.9998 39.5834 24.9998Z" fill="currentColor"></path>
            <path xmlns="http://www.w3.org/2000/svg" d="M30.0833 29.2083C28.4835 28.495 26.7516 28.126 25 28.125H18.75C15.4348 28.125 12.2554 29.442 9.91117 31.7862C7.56696 34.1304 6.25 37.3098 6.25 40.625V44.7917H33.3333V33.3125C31.9284 32.2332 30.8119 30.8233 30.0833 29.2083Z" fill="currentColor"></path>
          </svg>

          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">{device.friendly_name}</p>
            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{device.type}</p>
          </div>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-end">
          <p className="mt-1 text-xs leading-5 text-gray-500">Last seen <time dateTime={lastSeenAt}>3h ago</time></p>

          <a href="#" onClick={handleRemovePasskey} className="rounded-md bg-indigo-600 px-1.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Remove</a>
        </div>
      </li>
    )
  }

  const handleAddPasskey = async () => {
    try {
      const device = await passageCurrentUser.addDevice()

      // Authorizer doesn't support setting UserMetadata
      // TODO: Rename to external_user_id
      await passageCurrentUser.updateMetadata({
        supabase_id: session!.user.id,
      })

      setHasPasskey(true);
      setDevices([...devices, device])
    } catch (e) {
      alert("failed to add passkey")
    }
  }

  const handleRemovePasskey = async () => {
    try {
      const devices = await passageCurrentUser.listDevices()

      devices.forEach((device) => {
        passageCurrentUser.deleteDevice(device.id)

        setDevices(devices.filter((d) => d.id !== device.id))
      })

      setHasPasskey(false)

    } catch (e) {
      alert("failed to delete passkeys")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* <ul role="list" className="divide-y divide-gray-100">
        {devices.map((device) => { return (<Device device={device} key={device.id} />) })}
      </ul> */}

      {hasPasskey ?
        <Link href="#" onClick={handleRemovePasskey} className="rounded-md bg-indigo-600 px-1.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Remove Passkey</Link>
        :
        <Link href="#" onClick={handleAddPasskey} className="rounded-md bg-indigo-600 px-1.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add Passkey</Link>}
    </div>
  )
}
