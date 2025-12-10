import React from 'react'
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EN</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EventNow</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Admin
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6">
        <div className="py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Gérez vos demandes événementielles en toute simplicité
            </h1>
            <p className="text-xl text-gray-600 text-pretty mb-8 leading-relaxed">
              Une plateforme moderne pour soumettre et suivre vos demandes d'événements. Simple, rapide et efficace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/request"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Soumettre une demande
              </a>

            </div>
          </div>
          
          {/* Image Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop" 
                alt="Organisation d'événements" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">500+ Événements</p>
                    <p className="text-xs text-gray-500">Organisés avec succès</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}