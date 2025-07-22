"use client";

import {useEffect, useState} from "react";
import axios from "axios";
import AdminLayout from "@/app/layouts/adminlayout";

interface Produit {
  idProduit: number;
  nomProduit: string;
  terme: string;
  billing: string;
}

export default function ProduitsAdminPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [nomProduit, setNomProduit] = useState("");
  const [terme, setTerme] = useState("");
  const [billing, setBilling] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8070/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchProduits = async () => {
    try {
      const res = await axiosInstance.get("/produits");
      setProduits(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur de chargement des produits");
    }
  };

  const addProduit = async () => {
    try {
      const res = await axiosInstance.post("/produits", { nomProduit, terme, billing });
      setProduits([...produits, res.data]);
      clearForm();
      setMessage("✅ Produit ajouté");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de l'ajout");
    }
  };

  const deleteProduit = async (id: number) => {
    try {
      await axiosInstance.delete(`/produits/${id}`);
      setProduits(produits.filter((p) => p.idProduit !== id));
      setMessage("🗑️ Produit supprimé");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de suppression");
    }
  };

  const startEdit = (produit: Produit) => {
    setEditId(produit.idProduit);
    setNomProduit(produit.nomProduit);
    setTerme(produit.terme);
    setBilling(produit.billing);
  };

  const confirmEdit = async () => {
    if (editId === null) return;
    try {
      const res = await axiosInstance.put(`/produits/${editId}`, { nomProduit, terme, billing });
      setProduits(produits.map((p) => (p.idProduit === editId ? res.data : p)));
      setMessage("✏️ Produit modifié");
      clearForm();
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de modification");
    }
  };

  const clearForm = () => {
    setNomProduit("");
    setTerme("");
    setBilling("");
    setEditId(null);
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">📦 Gestion des Produits</h2>
        {message && <div className="text-red-500 text-sm">{message}</div>}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nom du Produit"
            value={nomProduit}
            onChange={(e) => setNomProduit(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Terme"
            value={terme}
            onChange={(e) => setTerme(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Billing"
            value={billing}
            onChange={(e) => setBilling(e.target.value)}
            className="border p-2 w-full rounded"
          />

          {editId ? (
            <button onClick={confirmEdit} className="bg-yellow-500 text-white w-full p-2 rounded">
              ✅ Confirmer la modification
            </button>
          ) : (
            <button onClick={addProduit} className="bg-blue-500 text-white w-full p-2 rounded">
              ➕ Ajouter
            </button>
          )}
        </div>

        <ul className="mt-6 divide-y">
          {produits.map((produit) => (
            <li key={produit.idProduit} className="flex justify-between items-center p-2">
              <span>
                {produit.nomProduit} – {produit.terme} – {produit.billing}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(produit)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteProduit(produit.idProduit)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
