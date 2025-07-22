"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/app/layouts/adminlayout";

interface Fournisseur {
  idFournisseur?: number;
  nom: string;
  email: string;
}

export default function FournisseursAdminPage() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [form, setForm] = useState<Fournisseur>({ nom: "", email: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8070/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchFournisseurs = async () => {
    try {
      const res = await axiosInstance.get("/fournisseurs");
      setFournisseurs(res.data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur de chargement");
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axiosInstance.put(`/fournisseurs/${editId}`, form);
        setMessage("✏️ Fournisseur modifié");
      } else {
        await axiosInstance.post("/fournisseurs", form);
        setMessage("✅ Fournisseur ajouté");
      }
      setForm({ nom: "", email: "" });
      setEditId(null);
      fetchFournisseurs();
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/fournisseurs/${id}`);
      setMessage("🗑️ Fournisseur supprimé");
      fetchFournisseurs();
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur de suppression");
    }
  };

  const handleEdit = (f: Fournisseur) => {
    setForm({ nom: f.nom, email: f.email });
    setEditId(f.idFournisseur!);
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">📦 Gestion des Fournisseurs</h1>
        {message && <div className="text-sm text-red-500">{message}</div>}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded w-full"
          >
            {editId ? "✅ Modifier" : "➕ Ajouter"}
          </button>
        </div>

        <ul className="space-y-2 mt-6">
          {fournisseurs.map((f) => (
            <li key={f.idFournisseur} className="border p-2 rounded flex justify-between items-center">
              <div>
                <p><strong>{f.nom}</strong></p>
                <p>{f.email}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(f)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  ✏️
                </button>
                <button onClick={() => handleDelete(f.idFournisseur!)} className="bg-red-500 text-white px-3 py-1 rounded">
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
