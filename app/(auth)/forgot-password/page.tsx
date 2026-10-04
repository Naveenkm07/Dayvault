'use client'

import { SignIn } from '@clerk/nextjs'

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path="/forgot-password"
          signUpUrl="/signup"
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