import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🔥 NEW

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // 🔥 Start loading

    try {
      // 1. Auth Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("UID:", user.uid);
      console.log("Email:", user.email);

      // 2. Vérification admin
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        window.location.href = "/dashboard";
      } else {
        await auth.signOut();
        setError("Accès refusé. Ce compte n'est pas un compte administrateur.");
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Identifiants invalides.");
    }

    setIsLoading(false); // 🔥 Stop loading
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion Admin</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            placeholder="Email admin"
            className="w-full px-4 py-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          {/* 🔥 Bouton avec Loading */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-2 rounded-lg text-white font-medium
              flex items-center justify-center gap-2
              transition-all
              ${isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
