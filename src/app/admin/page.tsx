"use client"

import { useState, useEffect } from "react"
import { Calendar, Search, Filter, LogOut, AlertCircle } from "lucide-react"
import { auth, db } from "../../../firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  getDoc
} from "firebase/firestore"

interface Request {
  requestId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "pending" | "processed" | "rejected"
  createdAt: Timestamp | null
}

export default function AdminPanel() {
  const [requests, setRequests] = useState<Request[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processed" | "rejected">("all")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  // ----- AUTH + VERIFICATION ADMIN -----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/login"
        return
      }

      setUserEmail(user.email || "")

      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid))

        if (!adminDoc.exists()) {
          await signOut(auth)
          setError("Accès refusé. Ce compte n'est pas un administrateur.")
          setTimeout(() => window.location.href = "/login", 2000)
          return
        }

        setIsCheckingAuth(false)
        fetchRequests()
      } catch (err) {
        setError("Erreur lors de la vérification administrateur.")
        setIsCheckingAuth(false)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // ----- CHARGEMENT DES DEMANDES -----
  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const snapshot = await getDocs(collection(db, "requests"))

      const data = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        requestId: docSnap.id
      })) as Request[]

      // Tri par date décroissante
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.seconds - a.createdAt.seconds
      })

      setRequests(data)
    } catch (err: any) {
      if (err.code === "permission-denied") {
        setError("Permission refusée. Votre compte n'est pas administrateur.")
      } else {
        setError("Impossible de charger les demandes.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ----- MISE À JOUR DU STATUT -----
  const updateStatus = async (id: string, newStatus: "pending" | "processed" | "rejected") => {
    try {
      await updateDoc(doc(db, "requests", id), { status: newStatus })

      const updated = requests.map((req) =>
        req.requestId === id ? { ...req, status: newStatus } : req
      )

      setRequests(updated)

      if (selectedRequest?.requestId === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus })
      }
    } catch (error) {
      setError("Impossible de mettre à jour le statut.")
    }
  }

  // ----- DÉCONNEXION -----
  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/login"
  }

  // ----- FILTRAGE -----
  const filteredRequests = requests.filter((req) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      req.firstName.toLowerCase().includes(search) ||
      req.lastName.toLowerCase().includes(search) ||
      req.email.toLowerCase().includes(search) ||
      req.subject.toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === "all" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ----- BADGES -----
  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
          En attente
        </span>
      )
    }

    if (status === "processed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          Traité
        </span>
      )
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
        Refusé
      </span>
    )
  }

  // ----- LOADING AUTH -----
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification administrateur...</p>
        </div>
      </div>
    )
  }

  // ----- ERREUR ACCÈS REFUSÉ -----
  if (error && error.includes("Accès refusé")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold">EventNow Admin</span>
          </a>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Panneau d'administration</h1>

        {/* ERREUR */}
        {error && !error.includes("Accès refusé") && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* RECHERCHE + FILTRES */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="processed">Traité</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="text-3xl font-bold">{requests.length}</div>
            <p className="text-sm text-gray-600">Total demandes</p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </div>
            <p className="text-sm text-gray-600">En attente</p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter((r) => r.status === "processed").length}
            </div>
            <p className="text-sm text-gray-600">Traité</p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <div className="text-3xl font-bold text-red-600">
              {requests.filter((r) => r.status === "rejected").length}
            </div>
            <p className="text-sm text-gray-600">Refusé</p>
          </div>
        </div>

        {/* LISTE + DÉTAILS */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* LISTE */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Liste des demandes</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center bg-white border rounded-xl">
                  <p className="text-gray-600">Aucune demande trouvée</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.requestId}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-6 rounded-xl border cursor-pointer transition ${
                      selectedRequest?.requestId === req.requestId
                        ? "border-blue-500 bg-blue-50 shadow"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{req.firstName} {req.lastName}</p>
                        <p className="text-sm text-gray-600">{req.email}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <p className="mt-3 font-medium">{req.subject}</p>

                    {req.createdAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.createdAt.seconds * 1000).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                ))
              )}
              </div>
            </div>

            {/* DÉTAILS */}
            <div className="lg:sticky lg:top-4">
              {selectedRequest ? (
                <div className="p-8 mt-11 bg-white border rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">Détails</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedRequest.email}</p>
                    </div>

                    {selectedRequest.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium">{selectedRequest.phone}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Objet</p>
                      <p className="font-medium">{selectedRequest.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Message</p>
                      <p className="font-medium whitespace-pre-wrap">{selectedRequest.message}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Soumis le</p>
                      <p className="font-medium">
                        {selectedRequest.createdAt &&
                          new Date(selectedRequest.createdAt.seconds * 1000).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>

                  {/* BOUTONS DE STATUT */}
                  <div className="mt-6 pt-6 border-t">
                    <label className="text-sm text-gray-600 block mb-3">Changer le statut</label>

                    <div className="grid grid-cols-3 gap-2">

                      {/* En attente */}
                      <button
                        onClick={() => updateStatus(selectedRequest.requestId, "pending")}
                        className={`px-4 py-2 rounded-lg border font-medium transition ${
                          selectedRequest.status === "pending"
                            ? "bg-yellow-500 text-white border-yellow-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        En attente
                      </button>

                      {/* Traité */}
                      <button
                        onClick={() => updateStatus(selectedRequest.requestId, "processed")}
                        className={`px-4 py-2 rounded-lg border font-medium transition ${
                          selectedRequest.status === "processed"
                            ? "bg-green-500 text-white border-green-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Traité
                      </button>

                      {/* Refusé */}
                      <button
                        onClick={() => updateStatus(selectedRequest.requestId, "rejected")}
                        className={`px-4 py-2 rounded-lg border font-medium transition ${
                          selectedRequest.status === "rejected"
                            ? "bg-red-500 text-white border-red-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Refusé
                      </button>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 mt-11 bg-white border rounded-xl text-center">
                  <p className="text-gray-600">Sélectionnez une demande pour voir les détails</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}