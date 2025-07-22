"use client";

import {useEffect, useState} from "react";
import AdminLayout from "@/app/layouts/adminlayout";
import {Role, User} from "@/app/core/models/user.model";
import axiosInstance from "@/app/core/axios/axios-instance";

export default function ClientsAdminPage() {

  const [clients, setClients] = useState<User[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get(`/users/role/${Role.CLIENT.toString()}`);
      setClients(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur de chargement");
    }
  };

  const addClient = async () => {
    try {
      const res = await axiosInstance.post('/users/client', {firstName, lastName, email, phoneNumber, password});
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
      await axiosInstance.delete(`/users/${id}`);
      setClients(clients.filter((c) => c.id !== id));
      setMessage("🗑️ Client supprimé");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de suppression");
    }
  };

  const startEdit = (client: User) => {
    setEditId(client.id);
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setPhoneNumber(client.phoneNumber);
  };

  const confirmEdit = async () => {
    if (!editId) return;
    try {
      const res = await axiosInstance.put(`/users/client/${editId}`, {firstName, lastName, phoneNumber});
      setClients(clients.map((c) => (c.id === editId ? res.data : c)));
      setMessage("✏️ Client modifié");
      clearForm();
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de modification");
    }
  };

  const clearForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setEditId(null);
  };

  useEffect(() => {
    fetchClients().then();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">📋 Gestion des Clients</h2>
        {message && <div className="text-red-500 text-sm">{message}</div>}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          {editId === null && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
            />
          )}
          <input
            type="text"
            placeholder="Téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 w-full rounded"
          />
          {editId === null && (
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
            />
          )}

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
            <li key={client.id} className="flex justify-between items-center p-2">
              <span>{client.firstName} – {client.lastName} – {client.email} – {client.phoneNumber}</span>
              <div className="space-x-2">
                <button
                  onClick={() => startEdit(client)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => deleteClient(client.id)}
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
