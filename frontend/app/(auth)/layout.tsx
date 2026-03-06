export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-md">
        
        {/* Card */}
       
          
          {/* Logo / Brand */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Smart Ecommerce
            </h1>
            <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">
              Welcome back. Please sign in.
            </p>
          </div>

          {/* Auth Form */}
          {children}

        </div>

      </div>

  )
}