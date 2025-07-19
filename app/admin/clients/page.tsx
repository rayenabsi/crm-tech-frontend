"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/app/layouts/adminlayout";

interface Client {
  idClient: number;
  nom: string;
  email: string;
  telephone: string;
}

export default function ClientsAdminPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8070/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur de chargement");
    }
  };

  const addClient = async () => {
    try {
      const res = await axiosInstance.post("/clients", { nom, email, telephone });
      setClients([...clients, res.data]);
      clearForm();
      setMessage("✅ Client ajouté");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de l'ajout");
    }
  };

  const deleteClient = async (id: number) => {
    try {
      await axiosInstance.delete(`/clients/${id}`);
      setClients(clients.filter((c) => c.idClient !== id));
      setMessage("🗑️ Client supprimé");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de suppression");
    }
  };

  const startEdit = (client: Client) => {
    setEditId(client.idClient);
    setNom(client.nom);
    setEmail(client.email);
    setTelephone(client.telephone);
  };

  const confirmEdit = async () => {
    if (editId === null) return;
    try {
      const res = await axiosInstance.put(`/clients/${editId}`, { nom, email, telephone });
      setClients(clients.map((c) => (c.idClient === editId ? res.data : c)));
      setMessage("✏️ Client modifié");
      clearForm();
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de modification");
    }
  };

  const clearForm = () => {
    setNom("");
    setEmail("");
    setTelephone("");
    setEditId(null);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">📋 Gestion des Clients</h2>
        {message && <div className="text-red-500 text-sm">{message}</div>}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="border p-2 w-full rounded"
          />

          {editId ? (
            <button onClick={confirmEdit} className="bg-yellow-500 text-white w-full p-2 rounded">
              ✅ Confirmer la modification
            </button>
          ) : (
            <button onClick={addClient} className="bg-blue-500 text-white w-full p-2 rounded">
              ➕ Ajouter
            </button>
          )}
        </div>

        <ul className="mt-6 divide-y">
          {clients.map((client) => (
            <li key={client.idClient} className="flex justify-between items-center p-2">
              <span>{client.nom} – {client.email} – {client.telephone}</span>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(client)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteClient(client.idClient)}
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
