import React, { useState } from "react"
import { Calendar, ArrowLeft, CheckCircle, Send } from "lucide-react"

export default function RequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide"
    }
    if (!formData.subject.trim()) newErrors.subject = "L'objet est requis"
    if (!formData.message.trim()) newErrors.message = "Le message est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // Simulate saving data (using state instead of localStorage)
    const newRequest = {
      id: Date.now().toString(),
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    setIsSubmitted(true)

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "/"
    }, 2000)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Demande envoyée !
          </h2>
          <p className="text-gray-600 text-lg">
            Votre demande a été soumise avec succès.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Redirection en cours...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EventNow
            </span>
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </a>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Soumettre une demande
          </h1>
          <p className="text-gray-600 text-lg">
            Remplissez le formulaire ci-dessous et nous reviendrons vers vous rapidement.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                  placeholder="Jean"
                />
                {errors.firstName && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.firstName}</span>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                  placeholder="Dupont"
                />
                {errors.lastName && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                  placeholder="jean.dupont@email.com"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Objet de la demande <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.subject ? "border-red-500 bg-red-50" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                placeholder="Conférence annuelle 2025"
              />
              {errors.subject && (
                <span className="text-red-500 text-sm mt-1 block">{errors.subject}</span>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? "border-red-500 bg-red-50" : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none`}
                placeholder="Décrivez votre projet événementiel en détail..."
              />
              {errors.message && (
                <span className="text-red-500 text-sm mt-1 block">{errors.message}</span>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-sm text-blue-900">
            <strong>💡 À savoir :</strong> Nous nous engageons à répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrées.
          </p>
        </div>
      </main>
    </div>
  )
}