"use client";

import React, {useEffect, useState} from "react";
import AdminLayout from "@/app/layouts/adminlayout";
import {Product} from "@/app/core/models/product.model";
import {createProduct, deleteProduct, getAllProducts, updateProduct} from "@/app/core/services/product.service";
import {Provider} from "@/app/core/models/provider.model";
import {getAllProviders} from "@/app/core/services/provider.service";

interface FormData {
  providerId: number | undefined;
  name: string;
  description: string;
  price: number;
}

export default function ProduitsAdminPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState<FormData>({name: "", description: "", providerId: undefined, price: 0});
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur de chargement des produits");
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await getAllProviders();
      setProviders(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        const res = await updateProduct(editId, {
          name: form.name,
          description: form.description || undefined,
          price: form.price!
        });
        setProducts(products.map((p) => (p.id === editId ? res : p)));
        setMessage("✏️ Produit modifié");
      } else {
        if (!form.price || form.price === 0) {
          setMessage("Veuillez saisir le prix");
          return;
        }
        if (!form.providerId) {
          setMessage("Veuillez sélectionner un fournisseur");
          return;
        }
        const res = await createProduct({
          name: form.name,
          description: form.description || undefined,
          price: form.price!,
          providerId: form.providerId
        });
        setProducts([res, ...products]);
        setMessage("✅ Produit ajouté");
      }
      clearForm();
    } catch (error) {
      console.error(error);
      setMessage("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setMessage("🗑️ Produit supprimé");
    } catch (err) {
      console.error(err);
      setMessage("❌ Échec de suppression");
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      providerId: undefined
    });
    setEditId(p.id);
  };

  const clearForm = () => {
    setForm({name: "", description: "", providerId: undefined, price: 0});
    setEditId(null);
  };

  useEffect(() => {
    fetchProducts().then();
    fetchProviders().then();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">📦 Gestion des Produits</h2>
        {message && <div className="text-red-500 text-sm">{message}</div>}

        <div className="space-y-2">
          <label htmlFor="product-name">Nom</label>
          <input
            id="product-name"
            type="text"
            placeholder="Nom du produit"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="border p-2 w-full rounded"
          />

          <label htmlFor="product-description">Desciption</label>
          <input
            id="product-description"
            type="text"
            placeholder="Desciption du produit"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            className="border p-2 w-full rounded"
          />

          <label htmlFor="product-price">Prix par mois</label>
          <input
            id="product-price"
            type="number"
            min={0}
            placeholder="Prix du produit"
            value={form.price}
            onChange={(e) => setForm({
              ...form,
              price: (e.target.value && !isNaN(Number(e.target.value))) ? Number(e.target.value) : 0
            })}
            className="border p-2 w-full rounded"
          />

          {editId === null && (
            <div>
              <label htmlFor="product-provider">Fournisseur</label>
              <select id="product-provider" className="border p-2 w-full rounded"
                      value={form.providerId}
                      onChange={(e) => setForm({
                        ...form,
                        providerId: (e.target.value && !isNaN(Number(e.target.value))) ? Number(e.target.value) : undefined
                      })}>
                <option key={undefined} value={undefined}>Fournisseur</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>)}

          <button onClick={handleSubmit}
                  className={editId ? "bg-yellow-500 text-white w-full p-2 rounded" : "bg-blue-500 text-white w-full p-2 rounded"}>
            {editId ? "✅ Modifier" : "➕ Ajouter"}
          </button>
        </div>

        <ul className="mt-6 divide-y">
          {products.map((product) => (
            <li key={product.id} className="flex justify-between items-center p-2">
              <span>
                {product.name} – {product.description || 'Aucune description'} – {product.price} TND – {product.provider.name}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded">
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded">
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
