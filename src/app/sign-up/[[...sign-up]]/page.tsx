import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <SignUp />
    </div>
  )
}
