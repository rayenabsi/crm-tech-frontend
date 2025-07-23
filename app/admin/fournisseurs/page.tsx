"use client";

import React, {useEffect, useState} from "react";
import AdminLayout from "@/app/layouts/adminlayout";
import {Provider} from "@/app/core/models/provider.model";
import {createProvider, deleteProvider, getAllProviders, updateProvider} from "@/app/core/services/provider.service";
import {useRouter} from "next/navigation";

interface FormData {
  name: string;
  email: string;
}

export default function FournisseursAdminPage() {

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProviderId, setCurrentProviderId] = useState<number | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: ""
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getAllProviders();
        setProviders(res);
      } catch (error) {
        console.error(error);
        setError("❌ Échec du chargement des fournisseurs");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.id.toString().includes(searchTerm)
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const initAddProvider = () => {
    setFormData({
      name: "",
      email: ""
    });
    setIsEditing(false);
    setCurrentProviderId(null);
    setShowForm(true);
  };

  const initEditProvider = (provider: Provider) => {
    setFormData({
      name: provider.name,
      email: provider.email
    });
    setIsEditing(true);
    setCurrentProviderId(provider.id);
    setShowForm(true);
  };

  const cancelAction = () => {
    setFormData({
      name: "",
      email: ""
    });
    setShowForm(false);
    setIsEditing(false);
    setCurrentProviderId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentProviderId) {
        const updatedProvider = await updateProvider(currentProviderId, formData);
        setProviders(providers.map(provider =>
          provider.id === currentProviderId ? updatedProvider : provider
        ));
        alert("✏️ Fournisseur modifié");
      } else {
        const newProvider = await createProvider(formData);
        setProviders([newProvider, ...providers]);
        alert("✅ Fournisseur ajouté");
      }
      cancelAction();
    } catch (err) {
      setError(isEditing ? "❌ Échec de la mise à jour" : "❌ Échec de la création");
      console.error(err);
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) return;
    try {
      await deleteProvider(providerId);
      setProviders(providers.filter(provider => provider.id !== providerId));
      alert("✅ Fournisseur supprimé");
    } catch (err) {
      setError("❌ Échec de la suppression du fournisseur");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏭 Gestion des Fournisseurs</h1>
          <button
            onClick={initAddProvider}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={showForm}
          >
            + Nouveau fournisseur
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulaire intégré */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Modifier le fournisseur" : "Ajouter un nouveau fournisseur"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={cancelAction}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {isEditing ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="Rechercher par nom, email ou contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Tableau des fournisseurs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Aucun fournisseur trouvé
                  </td>
                </tr>
              ) : (
                filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {provider.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/*<button*/}
                      {/*  onClick={() => router.push(`/admin/providers/${provider.id}`)}*/}
                      {/*  className="text-blue-600 hover:text-blue-900 mr-3"*/}
                      {/*>*/}
                      {/*  Voir*/}
                      {/*</button>*/}
                      <button
                        onClick={() => initEditProvider(provider)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
