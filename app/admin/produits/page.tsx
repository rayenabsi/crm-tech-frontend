"use client";

import React, {useEffect, useState} from "react";
import AdminLayout from "@/app/layouts/adminlayout";
import {Product} from "@/app/core/models/product.model";
import {createProduct, deleteProduct, getAllProducts, updateProduct} from "@/app/core/services/product.service";
import {Provider} from "@/app/core/models/provider.model";
import {getAllProviders} from "@/app/core/services/provider.service";
import {useRouter} from "next/navigation";

interface FormData {
  providerId: string;
  name: string;
  description: string;
  price: number;
}

export default function ProduitsAdminPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    providerId: "",
    name: "",
    description: "",
    price: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, providersData] = await Promise.all([
          getAllProducts(),
          getAllProviders()
        ]);
        setProducts(productsData);
        setProviders(providersData);
      } catch (err) {
        setError("❌ Échec du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value
    }));
  };

  const initAddProduct = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      providerId: ""
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setShowForm(true);
  };

  const initEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      providerId: product.provider.id.toString()
    });
    setIsEditing(true);
    setCurrentProductId(product.id);
    setShowForm(true);
  };

  const cancelAction = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentProductId(null);
    setError(null);
  };

  const fetchProviders = async () => {
    try {
      const res = await getAllProviders();
      setProviders(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.providerId) {
      setError("Veuillez sélectionner un fournisseur");
      return;
    }

    try {
      const productData = {
        ...formData,
        providerId: parseInt(formData.providerId)
      };

      if (isEditing && currentProductId) {
        const updatedProduct = await updateProduct(currentProductId, productData);
        setProducts(products.map(product =>
          product.id === currentProductId ? updatedProduct : product
        ));
        alert("✏️ Produit modifié");
      } else {
        const newProduct = await createProduct(productData);
        setProducts([newProduct, ...products]);
        alert("✅ Produit ajouté");
      }
      cancelAction();
    } catch (err) {
      setError(isEditing ? "❌ Échec de la mise à jour" : "❌ Échec de la création");
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError("❌ Échec de la suppression du produit");
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
          <h1 className="text-3xl font-bold">📦 Gestion des Produits</h1>
          <button
            onClick={initAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={showForm}
          >
            + Nouveau produit
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
              {isEditing ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (TND/mois)*</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur*</label>
                  <select
                    name="providerId"
                    value={formData.providerId}
                    onChange={handleFormChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selectionner un fournisseur</option>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
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
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix par mois</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {product.description || "Aucune description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {product.price.toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.provider.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => initEditProduct(product)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
