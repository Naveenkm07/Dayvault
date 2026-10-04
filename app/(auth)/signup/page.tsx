'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
              card: 'shadow-lg',
            },
          }}
        />
      </div>
    </div>
  )
}