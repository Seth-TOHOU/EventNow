import { useState } from "react";
import {
  Calendar,
  Search,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export default function UserRequestsViewer() {
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchRequests = async () => {
    if (!email.trim()) {
      setError("Veuillez entrer une adresse email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      // 🔥 Requête Firestore pour filtrer par email
      const q = query(
        collection(db, "requests"),
        where("email", "==", email.trim())
      );

      const snapshot = await getDocs(q);

      const results = snapshot.docs.map((docSnap) => ({
        requestId: docSnap.id,
        ...docSnap.data(),
      }));

      setRequests(results);
    } catch (err) {
      console.error("Erreur Firestore:", err);
      setError(
        "Erreur lors de la récupération des demandes. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchRequests();
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
          <Clock className="h-3 w-3" />
          En attente
        </div>
      );
    }

    if (status === "processed") {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="h-3 w-3" />
          Traité
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
        <XCircle className="h-3 w-3" />
        Refusé
      </div>
    );
  };

  const getStatusMessage = (status) => {
    if (status === "pending") {
      return "Votre demande est en cours de traitement. Nous vous contacterons bientôt.";
    }
    if (status === "processed") {
      return "Votre demande a été traitée avec succès.";
    }
    return "Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* NAVBAR */}
      <nav className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <a href="/" className="text-xl font-semibold">EventNow</a>
          </div>
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            Retour à l'accueil
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* EN-TÊTE */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Suivi de vos demandes
          </h1>
          <p className="text-gray-600 text-lg">
            Entrez votre adresse email pour consulter l'état de vos demandes
          </p>
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            <button
              onClick={searchRequests}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Rechercher
                </>
              )}
            </button>
          </div>

          {/* MESSAGE D'ERREUR */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* RÉSULTATS */}
        {hasSearched && !isLoading && (
          <div>
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucune demande trouvée
                </h3>
                <p className="text-gray-600">
                  Aucune demande n'est associée à cette adresse email.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vos demandes ({requests.length})
                  </h2>
                </div>

                <div className="space-y-6">
                  {requests.map((req) => (
                    <div
                      key={req.requestId}
                      className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition"
                    >
                      {/* EN-TÊTE */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {req.subject}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Soumis le{" "}
                            {new Date(
                              req.createdAt.seconds * 1000
                            ).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* MESSAGE DE STATUT */}
                      <div
                        className={`p-4 rounded-lg mb-4 ${
                          req.status === "pending"
                            ? "bg-yellow-50 border border-yellow-200"
                            : req.status === "processed"
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            req.status === "pending"
                              ? "text-yellow-800"
                              : req.status === "processed"
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {getStatusMessage(req.status)}
                        </p>
                      </div>

                      {/* DÉTAILS */}
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Votre message
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {req.message.length > 200
                              ? req.message.substring(0, 200) + "..."
                              : req.message}
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Nom</p>
                            <p className="text-sm font-medium text-gray-900">
                              {req.firstName} {req.lastName}
                            </p>
                          </div>
                          {req.phone && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Téléphone
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {req.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INFO */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Note importante</p>
              <p>
                Si vous ne trouvez pas votre demande, vérifiez que vous utilisez
                la même adresse email que celle fournie lors de votre demande.
                Pour toute question, contactez-nous directement.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
