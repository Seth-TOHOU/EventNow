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
  status: "pending" | "processed"
  createdAt: Timestamp | null
}

export default function AdminPanel() {
  const [requests, setRequests] = useState<Request[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processed">("all")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  // ----- PROTECTION PAR AUTHENTIFICATION ET VÉRIFICATION ADMIN -----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔍 onAuthStateChanged déclenché", { user: user?.email, uid: user?.uid })
      
      if (!user) {
        console.log("❌ Pas d'utilisateur connecté, redirection...")
        window.location.href = "/login"
        return
      }

      setUserEmail(user.email || "")
      console.log("✅ Utilisateur connecté:", user.email, "UID:", user.uid)

      // Vérifier si l'utilisateur est admin
      try {
        console.log("🔍 Vérification du document admin avec UID:", user.uid)
        const adminDocRef = doc(db, "admins", user.uid)
        const adminDoc = await getDoc(adminDocRef)
        
        console.log("📄 Document admin existe?", adminDoc.exists())
        console.log("📄 Données du document:", adminDoc.data())

        if (!adminDoc.exists()) {
          console.log("❌ Document admin n'existe pas pour UID:", user.uid)
          await signOut(auth)
          setError("Accès refusé. Ce compte n'est pas un compte administrateur.")
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
          return
        }

        console.log("✅ Utilisateur est admin, chargement des demandes...")
        setIsCheckingAuth(false)
        fetchRequests()
      } catch (err) {
        console.error("❌ Erreur de vérification admin:", err)
        setError("Erreur de vérification des privilèges administrateur")
        setIsCheckingAuth(false)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // ----- CHARGEMENT DES DONNÉES FIRESTORE -----
  const fetchRequests = async () => {
    try {
      console.log("📥 Début du chargement des demandes...")
      setIsLoading(true)
      setError("")
      const snapshot = await getDocs(collection(db, "requests"))
      console.log("📊 Nombre de documents trouvés:", snapshot.docs.length)
      
      const data = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        requestId: docSnap.id,
      })) as Request[]

      console.log("📋 Données chargées:", data)

      // Tri par date décroissante
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.seconds - a.createdAt.seconds
      })

      setRequests(data)
      console.log("✅ Demandes chargées avec succès:", data.length)
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des demandes:", err)
      console.error("Code d'erreur:", err.code)
      console.error("Message d'erreur:", err.message)

      // Message d'erreur spécifique selon le type d'erreur
      if (err.code === 'permission-denied') {
        setError("Permission refusée. Vérifiez que votre compte est bien administrateur dans Firestore.")
      } else {
        setError("Impossible de charger les demandes. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // ----- MISE À JOUR DU STATUT -----
  const updateStatus = async (id: string, newStatus: "pending" | "processed") => {
    try {
      await updateDoc(doc(db, "requests", id), {
        status: newStatus,
      })

      const updated = requests.map((req) =>
        req.requestId === id ? { ...req, status: newStatus } : req
      )

      setRequests(updated)

      if (selectedRequest?.requestId === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus })
      }
    } catch (error) {
      console.error("Erreur Firestore:", error)
      setError("Impossible de mettre à jour le statut.")
    }
  }

  // ----- DÉCONNEXION -----
  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/login"
    } catch (error) {
      console.error("Erreur de déconnexion:", error)
    }
  }

  // ----- SYSTÈME DE FILTRAGE -----
  const filteredRequests = requests.filter((req) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      req.firstName.toLowerCase().includes(search) ||
      req.lastName.toLowerCase().includes(search) ||
      req.email.toLowerCase().includes(search) ||
      req.subject.toLowerCase().includes(search)

    const matchesStatus = statusFilter === "all" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ----- BADGE DE STATUT -----
  const getStatusBadge = (status: string) =>
    status === "pending" ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
        En attente
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
        Traité
      </span>
    )

  // ----- ÉCRAN DE CHARGEMENT INITIAL (vérification auth + admin) -----
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Vérification des privilèges administrateur...</p>
        </div>
      </div>
    )
  }

  // ----- ÉCRAN D'ERREUR (accès refusé) -----
  if (error && error.includes("Accès refusé")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">EventNow Admin</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Panneau d'administration</h1>

        {/* MESSAGE D'ERREUR */}
        {error && !error.includes("Accès refusé") && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes("Permission refusée") && (
                <p className="text-xs text-red-600 mt-2">
                  💡 <strong>Astuce:</strong> Créez un document dans la collection "admins" avec votre UID comme ID de document.
                </p>
              )}
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
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="processed">Traité</option>
            </select>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
            <div className="text-sm text-gray-600">Total demandes</div>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter((r) => r.status === "processed").length}
            </div>
            <div className="text-sm text-gray-600">Traité</div>
          </div>
        </div>

        {/* LISTE ET DÉTAILS */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement des demandes...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* LISTE DES DEMANDES */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center border border-gray-200 rounded-xl bg-white">
                  <p className="text-gray-600">Aucune demande trouvée</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.requestId}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-6 rounded-xl border cursor-pointer transition-all ${
                      selectedRequest?.requestId === req.requestId
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {req.firstName} {req.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{req.email}</p>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <p className="mt-3 font-medium text-gray-800">{req.subject}</p>

                    {req.createdAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(req.createdAt.seconds * 1000).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* DÉTAILS DE LA DEMANDE */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {selectedRequest ? (
                <div className="p-8 rounded-xl border border-gray-200 bg-white shadow-sm">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">Détails</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nom complet</p>
                      <p className="text-gray-900">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-gray-900">{selectedRequest.email}</p>
                    </div>

                    {selectedRequest.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Téléphone</p>
                        <p className="text-gray-900">{selectedRequest.phone}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-600">Objet</p>
                      <p className="text-gray-900">{selectedRequest.subject}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Message</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.message}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Date de soumission</p>
                      <p className="text-gray-900">
                        {selectedRequest.createdAt &&
                          new Date(selectedRequest.createdAt.seconds * 1000).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                      </p>
                    </div>
                  </div>

                  {/* BOUTONS DE STATUT */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 block mb-3">Changer le statut</label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(selectedRequest.requestId, "pending")}
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                          selectedRequest.status === "pending"
                            ? "bg-yellow-500 text-white border-yellow-600 shadow-sm"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        En attente
                      </button>

                      <button
                        onClick={() => updateStatus(selectedRequest.requestId, "processed")}
                        className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                          selectedRequest.status === "processed"
                            ? "bg-green-500 text-white border-green-600 shadow-sm"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Traité
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-gray-200 bg-white text-center">
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