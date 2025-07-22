"use client";

import React, {useEffect, useState} from "react";
import AdminLayout from "@/app/layouts/adminlayout";
import {Provider} from "@/app/core/models/provider.model";
import {ProviderRequest} from "@/app/core/models/request/provider-request.model";
import {createProvider, deleteProvider, getAllProviders, updateProvider} from "@/app/core/services/provider.service";

export default function FournisseursAdminPage() {

  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<ProviderRequest>({name: "", email: ""});
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchProviders = async () => {
    try {
      const res = await getAllProviders();
      setProviders(res);
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur de chargement");
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        const res = await updateProvider(editId, form);
        setMessage("✏️ Fournisseur modifié");
        setProviders(providers.map((p) => (p.id === editId ? res : p)));
      } else {
        const res = await createProvider(form);
        setMessage("✅ Fournisseur ajouté");
        setProviders([res, ...providers]);
      }
      clearForm();
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProvider(id);
      setMessage("🗑️ Fournisseur supprimé");
      setProviders(providers.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur de suppression");
    }
  };

  const handleEdit = (f: Provider) => {
    setForm({name: f.name, email: f.email});
    setEditId(f.id);
  };

  const clearForm = () => {
    setForm({name: "", email: ""});
    setEditId(null);
  };

  useEffect(() => {
    fetchProviders().then();
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
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            className="border p-2 rounded w-full"
          />
          <button onClick={handleSubmit}
                  className="bg-blue-500 text-white p-2 rounded w-full">
            {editId ? "✅ Modifier" : "➕ Ajouter"}
          </button>
        </div>

        <ul className="space-y-2 mt-6">
          {providers.map((f) => (
            <li key={f.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <p><strong>{f.name}</strong></p>
                <p>{f.email}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(f)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                  ✏️
                </button>
                <button onClick={() => handleDelete(f.id!)} className="bg-red-500 text-white px-3 py-1 rounded">
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
