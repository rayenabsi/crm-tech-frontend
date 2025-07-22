"use client";

import {useEffect, useState} from "react";
import axios from "axios";
import ClientLayout from "@/app/layouts/client-layout";

interface Produit {
  idProduit: number;
  nomProduit: string;
  terme: string;
  billing: string;
}

interface Fournisseur {
  idFournisseur: number;
  nom: string;
}

export default function AbonnementClientPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [selectedProduit, setSelectedProduit] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8070/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    axiosInstance.get("/produits")
      .then((res) => setProduits(res.data))
      .catch(() => setMessage("❌ Erreur chargement produits"));

    axiosInstance.get("/fournisseurs")
      .then((res) => setFournisseurs(res.data))
      .catch(() => setMessage("❌ Erreur chargement fournisseurs"));
  }, []);

  const handleAbonnement = () => {
    const dto = {
      dateDebut,
      dateFin,
      quantite,
      statut: "ACTIF",
      fournisseurId: parseInt(selectedFournisseur),
      produitIds: [parseInt(selectedProduit)],
      // clientId: null ← SUPPRIMÉ
    };


    axiosInstance.post("/abonnements", dto)
      .then(() => {
        setSuccess(true);
        setMessage("✅ Abonnement créé avec succès !");
      })
      .catch(() => {
        setSuccess(false);
        setMessage("❌ Erreur lors de la création de l’abonnement");
      });
  };

  return (
    <ClientLayout>
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            ➕ Créer un Abonnement
          </h1>

          {message && (
            <div className={`text-center font-medium mb-4 ${success ? "text-green-600" : "text-red-600"}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <label className="block">
              📦 Produit
              <select
                value={selectedProduit}
                onChange={(e) => setSelectedProduit(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="">-- Choisir un Produit --</option>
                {produits.map((p) => (
                  <option key={p.idProduit} value={p.idProduit}>
                    {p.nomProduit}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              🏢 Fournisseur
              <select
                value={selectedFournisseur}
                onChange={(e) => setSelectedFournisseur(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              >
                <option value="">-- Choisir un Fournisseur --</option>
                {fournisseurs.map((f) => (
                  <option key={f.idFournisseur} value={f.idFournisseur}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              🗓️ Date de début
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </label>

            <label className="block">
              🗓️ Date de fin
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full border p-2 rounded mt-1"
              />
            </label>

            <label className="block">
              🔢 Quantité
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(parseInt(e.target.value))}
                min={1}
                className="w-full border p-2 rounded mt-1"
              />
            </label>

            <button
              onClick={handleAbonnement}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
            >
              ➕ Confirmer l'abonnement
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
