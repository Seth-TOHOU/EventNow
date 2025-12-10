    import React, { useState } from "react"
    import { Calendar, ArrowLeft, CheckCircle, Send, AlertCircle } from "lucide-react"
    import { auth, db } from "../../../firebase"
    import {
      createUserWithEmailAndPassword,
      signInAnonymously,
      updateProfile
    } from "firebase/auth"
    import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore"

    export default function RequestForm() {
      const [isSubmitted, setIsSubmitted] = useState(false)
      const [isLoading, setIsLoading] = useState(false)
      const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      })
      const [errors, setErrors] = useState({})
      const [firebaseError, setFirebaseError] = useState("")

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

      const handleSubmit = async (e) => {
        e.preventDefault()
        setFirebaseError("")

        if (!validateForm()) return

        setIsLoading(true)

        try {
          // Enregistrer la demande directement sans créer de compte utilisateur
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

          await setDoc(doc(db, "requests", requestId), {
            requestId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || "",
            subject: formData.subject,
            message: formData.message,
            status: "pending",
            createdAt: serverTimestamp()
          })

          setIsSubmitted(true)
          setIsLoading(false)

          // Redirection après 3 secondes
          setTimeout(() => {
            window.location.href = "/"
          }, 3000)

        } catch (error) {
          console.error("Erreur Firebase:", error)
          setIsLoading(false)

          switch (error.code) {
            case "permission-denied":
              setFirebaseError("Accès refusé. Veuillez vérifier les permissions Firestore.")
              break
            case "network-request-failed":
              setFirebaseError("Problème de connexion internet.")
              break
            case "unavailable":
              setFirebaseError("Service temporairement indisponible. Réessayez plus tard.")
              break
            default:
              setFirebaseError("Une erreur est survenue. Veuillez réessayer.")
          }
        }
      }

      const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: "" }))
        }
        if (firebaseError) {
          setFirebaseError("")
        }
      }

      // ---------------- SUCCESS SCREEN ----------------
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
              <p className="text-gray-600 text-lg mb-2">
                Votre demande a été enregistrée avec succès.
              </p>
              <p className="text-sm text-gray-500">Redirection en cours…</p>
            </div>
          </div>
        )
      }

      // ---------------- FORMULAIRE ----------------
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

            {firebaseError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{firebaseError}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Noms */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="Jean"
                    />
                    {errors.firstName && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.firstName}</span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                      placeholder="Dupont"
                    />
                    {errors.lastName && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="jean.dupont@email.com"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone (optionnel)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                {/* Objet */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Objet de la demande *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.subject ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    placeholder="Conférence annuelle 2025"
                  />
                  {errors.subject && (
                    <span className="text-red-500 text-sm mt-1 block">{errors.subject}</span>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.message ? "border-red-500 bg-red-50" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none`}
                    placeholder="Décrivez votre projet événementiel en détail..."
                  />
                  {errors.message && (
                    <span className="text-red-500 text-sm mt-1 block">{errors.message}</span>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Envoyer la demande
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-sm text-blue-900">
                💡 <strong>Astuce :</strong> Nous répondons sous 24 à 48h ouvrées.
              </p>
            </div>
          </main>
        </div>
      )
    }