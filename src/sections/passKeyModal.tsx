import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import {
  passageCurrentUser, passage
} from '@/utils/passage';
import Passkey from '@/components/images/passkey';

export default function PassKeyModal() {
  const [showModal, setShowModal] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user.email) return

    passage.identifierExists(session.user.email).then((user) => {
      passage.createCredentialAvailable().then((createCredential) => {
        if (!user.hasPasskey && createCredential.isAvailable) {
          setShowModal(true)
        }
      })
    })
  }, [session?.user.email]);

  const handleAddPasskey = async () => {
    try {
      await passageCurrentUser.addDevice()

      // Authorizer doesn't support setting UserMetadata
      // TODO: Rename to external_user_id
      await passageCurrentUser.updateMetadata({
        supabase_id: session!.user.id,
      })

      setShowModal(false)

    } catch (e) {
      alert("failed to add passkey")
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  if (!showModal) {
    return null
  }

  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <Passkey />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Tired of Passwords?</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Log into your account with the method you already use to unlock your device.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" onClick={handleCloseModal} className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto">Maybe Later</button>
              <button onClick={handleAddPasskey} type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Enable Passkeys</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
