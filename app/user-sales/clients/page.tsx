"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserSalesLayout from "@/app/layouts/usersaleslayout";

interface Client {
  idClient: number;
  nom: string;
  email: string;
  telephone: string;
}

export default function ClientsUserSalesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [message, setMessage] = useState("");

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
      setMessage("❌ Erreur lors du chargement des clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <UserSalesLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-blue-700">📋 Liste des Clients</h2>
        {message && <p className="text-red-500">{message}</p>}

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div
              key={client.idClient}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
            >
              <p className="font-semibold text-gray-700">
                👤 <span className="text-black">{client.nom}</span>
              </p>
              <p className="text-sm text-gray-500">📧 {client.email}</p>
              <p className="text-sm text-gray-500">📞 {client.telephone}</p>
            </div>
          ))}
        </div>
      </div>
    </UserSalesLayout>
  );
}
