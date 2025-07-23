"use client";

import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {Role, User} from "@/app/core/models/user.model";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {

      const res = await axios.post("http://localhost:8070/api/auth/login", {
        email,
        password,
      });

      const token: string = res.data.token;
      const user: User = res.data.user;
      localStorage.setItem("crm_tech_token", token);
      localStorage.setItem("crm_tech_user", JSON.stringify(user));

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded?.role || decoded?.authorities?.[0];
      const userId = decoded?.sub;
      localStorage.setItem("crm_tech_user_id", userId);

      if (role.includes(Role.ADMIN.toString())) router.push("/admin/abonnements");
      else if (role.includes(Role.SALES_AGENT.toString())) router.push("/user-sales/clients");
      else if (role.includes(Role.TECH_AGENT.toString())) router.push("/usertech/dashboard");
      else if (role.includes(Role.CLIENT.toString())) router.push("/client/abonnements");
      else router.push("/");

    } catch (err) {
      setError("❌ Identifiants invalides ou erreur serveur");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md border border-blue-200">
        <h1 className="text-3xl font-extrabold text-blue-600 text-center mb-6">
          🔐 Connexion CRM_INSOMEA
        </h1>
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          ⓘ Entrez vos identifiants pour accéder au système
        </p>
      </div>
    </div>
  );
}
