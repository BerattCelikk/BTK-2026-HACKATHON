import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">FinanceAI Pro</h1>
          <p className="mt-2 text-gray-400">Ücretsiz hesap oluşturun</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-900 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 rounded-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-gray-800 border-gray-700 text-white",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              dividerLine: "bg-gray-700",
              dividerText: "text-gray-500",
              socialButtonsBlockButton: "bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
            },
          }}
        />
      </div>
    </div>
  )
}
