import { getCsrfToken, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { passage } from "@/utils/passage";
import { useRouter } from "next/router";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const [showPassword, setShowPassword] = useState(false);
  // const [csrfToken, setCsrfToken] = useState("")
  const router = useRouter();
  // const csrfToken = await getCsrfToken()

  useEffect(() => {}, []);

  const handleCredentialLogin = async (email: string, password: string) => {
    if (!showPassword) return setShowPassword(true);

    return signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: router.query.callbackUrl as string,
    });
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    return signIn("customProvider");

    const email = e.target.email?.value;
    const password = e.target.password?.value;

    const user = await passage.identifierExists(email);

    if (!user) {
      await handleCredentialLogin(email, password);
      return;
    }

    if (
      user.hasPasskey &&
      (await passage.getCredentialAvailable()).isAvailable
    ) {
      try {
        await passage.login(email);
      } catch (error) {
        await handleCredentialLogin(email, password);
      }
    } else {
      await handleCredentialLogin(email, password);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen font-medium">
      <div className="flex flex-grow items-center justify-center bg-gray-900 h-full">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              className="mx-auto h-10 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
              alt="Your Company"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            {/* <form className="space-y-6" onSubmit={handleLogin}>
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email webauthn"
                    required
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {showPassword && <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                    Password
                  </label>
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>}


              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>


                <button
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => signIn("oidc")}
                >Custom Provider</button>
              </div>
            </form> */}

            <button
              className="mb-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => signIn("passage")}
            >
              Sign In With Passage
            </button>

            <button
              className="mb-5 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => signIn("cognito")}
            >
              Sign In With Cognito
            </button>

            {/* <button
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => signIn("example")}
            >
              Sign In With Example
            </button> */}

            <p className="mt-10 text-center text-sm text-gray-500">
              Not a member?{" "}
              <Link
                href={{
                  pathname: "/auth/signup",
                  query: { callbackUrl: router.query.callbackUrl },
                }}
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Start a 14 day free trial
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  return {
    props: {},
  };
}
