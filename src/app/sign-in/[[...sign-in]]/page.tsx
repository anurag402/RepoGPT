import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
      <SignIn />
    </div>
  )
}
