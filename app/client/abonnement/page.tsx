"use client";

import {useEffect, useState} from "react";
import {Provider} from "@/app/core/models/provider.model";
import {Product} from "@/app/core/models/product.model";
import {getAllProviders} from "@/app/core/services/provider.service";
import {getProductsByProvider} from "@/app/core/services/product.service";
import {PaymentMethod, SubscriptionPeriod} from "@/app/core/models/subscription.model";
import {CreateSubscriptionRequest} from "@/app/core/models/request/subscription-request.model";
import {createSubscription} from "@/app/core/services/subscription.service";
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

  const [providers, setProviders] = useState<Provider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<SubscriptionPeriod | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState({
    providers: true,
    products: false
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getAllProviders();
        setProviders(res);
      } catch (error) {
        console.error(error);
        setError("❌ Erreur chargement fournisseurs");
      } finally {
        setLoading(prev => ({...prev, providers: false}));
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      setLoading(prev => ({...prev, products: true}));
      setSelectedProducts([]);

      const fetchProductsByProvider = async () => {
        try {
          const data = await getProductsByProvider(selectedProvider);
          setProducts(data);
        } catch (err) {
          setError("❌ Erreur de chargement des produits");
          console.error(err);
        } finally {
          setLoading(prev => ({...prev, products: false}));
        }
      };
      fetchProductsByProvider();
    }
  }, [selectedProvider]);

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateTotal = () => {
    if (selectedProducts.length === 0) return 0;

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    const baseAmount = selectedProductsData.reduce((sum, product) => sum + product.price, 0);

    switch (subscriptionPeriod) {
      case SubscriptionPeriod.ONE_MONTH:
        return baseAmount;
      case SubscriptionPeriod.THREE_MONTHS:
        return baseAmount * 3;
      case SubscriptionPeriod.SIX_MONTHS:
        return baseAmount * 6 * 0.95;
      case SubscriptionPeriod.ONE_YEAR:
        return baseAmount * 12 * 0.9;
      case SubscriptionPeriod.TWO_YEARS:
        return baseAmount * 24 * 0.8;
      default:
        return baseAmount;
    }
  };

  const handleSubmit = async () => {

    if (!selectedProvider || selectedProducts.length === 0) {
      setError("❌ Veuillez séléctionner un fournisseur et au moins un produit");
      return;
    }
    if (!subscriptionPeriod) {
      setError("❌ Veuillez séléctionner la période d'abonnement");
      return;
    }
    if (!paymentMethod) {
      setError("❌ Veuillez séléctionner votre méthode de paiment");
      return;
    }

    try {
      const request: CreateSubscriptionRequest = {
        providerId: selectedProvider,
        productIds: selectedProducts,
        period: subscriptionPeriod,
        billing: {
          amount: calculateTotal(),
          paymentMethod,
          currency: 'TND'
        }
      };
      const data = await createSubscription(request);
      clearForm();
      alert("Votre abonnement a été créé avec succès !");
    } catch (err) {
      setError("❌ Échec de la création de l'abonnement");
      console.error(err);
    }
  };

  const clearForm = () => {
    setProducts([]);
    setSelectedProvider(null);
    setSelectedProducts([]);
    setSubscriptionPeriod(null);
    setPaymentMethod(null);
    setError(null);
    setLoading({
      providers: true,
      products: false
    });
  };

  const printSubscriptionPeriodName = (): string => {
    switch (subscriptionPeriod) {
      case SubscriptionPeriod.ONE_MONTH:
        return '1 mois';
      case SubscriptionPeriod.THREE_MONTHS:
        return '3 mois';
      case SubscriptionPeriod.SIX_MONTHS:
        return '6 mois';
      case SubscriptionPeriod.ONE_YEAR:
        return '1 an';
      case SubscriptionPeriod.TWO_YEARS:
        return '2 ans';
      default:
        return '';
    }
  };

  const printPaymentMethodName = (): string => {
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return 'Carte de crédit/débit';
      case PaymentMethod.PAYPAL:
        return 'PayPal';
      case PaymentMethod.BANK_TRANSFER:
        return 'Virement bancaire';
      default:
        return '';
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-1xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center">Créer un nouvel abonnement</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step 1: Provider Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. Sélectionner un fournisseur</h2>
          <select
            className="w-full p-3 border rounded-lg"
            value={selectedProvider || ""}
            onChange={(e) => setSelectedProvider(e.target.value ? Number(e.target.value) : null)}
            disabled={loading.providers}>
            <option value="">Sélectionnez un fournisseur</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          {loading.providers && <p className="mt-2 text-gray-500">Chargement des fournisseurs...</p>}
        </div>

        {/* Step 2: Product Selection */}
        {selectedProvider && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">2. Sélectionner les produits</h2>

            {loading.products ? (
              <p className="text-gray-500">Chargement des produits...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-500">Aucun produit disponible pour ce fournisseur</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProducts.includes(product.id)
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      <span className="font-semibold">{product.price.toFixed(2)} TND/mois</span>
                    </div>
                    {selectedProducts.includes(product.id) && (
                      <div className="mt-2 text-sm text-blue-600">
                        ✓ Sélectionné
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Subscription Details */}
        {selectedProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">3. Détails de l'abonnement</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Période d'abonnement</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={subscriptionPeriod === SubscriptionPeriod.ONE_MONTH}
                      onChange={() => setSubscriptionPeriod(SubscriptionPeriod.ONE_MONTH)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>1 mois</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={subscriptionPeriod === SubscriptionPeriod.THREE_MONTHS}
                      onChange={() => setSubscriptionPeriod(SubscriptionPeriod.THREE_MONTHS)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>3 mois</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={subscriptionPeriod === SubscriptionPeriod.SIX_MONTHS}
                      onChange={() => setSubscriptionPeriod(SubscriptionPeriod.SIX_MONTHS)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>6 mois (5% de réduction)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={subscriptionPeriod === SubscriptionPeriod.ONE_YEAR}
                      onChange={() => setSubscriptionPeriod(SubscriptionPeriod.ONE_YEAR)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>1 an (10% de réduction)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={subscriptionPeriod === SubscriptionPeriod.TWO_YEARS}
                      onChange={() => setSubscriptionPeriod(SubscriptionPeriod.TWO_YEARS)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>2 ans (20% de réduction)</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Mode de paiement</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={paymentMethod === PaymentMethod.CREDIT_CARD}
                      onChange={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Carte de crédit/débit</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={paymentMethod === PaymentMethod.PAYPAL}
                      onChange={() => setPaymentMethod(PaymentMethod.PAYPAL)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {selectedProducts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">4. Résumé de la commande</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Fournisseur:</span>
                <span className="font-medium">
                {providers.find(p => p.id === selectedProvider)?.name}
              </span>
              </div>

              <div>
                <p className="font-medium">Produits sélectionnés:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {products
                    .filter(p => selectedProducts.includes(p.id))
                    .map(product => (
                      <li key={product.id}>
                        {product.name} ({product.price.toFixed(2)} TND/mois)
                      </li>
                    ))}
                </ul>
              </div>

              <div className="flex justify-between">
                <span>Abonnement:</span>
                <span className="font-medium">
                {printSubscriptionPeriodName()}
              </span>
              </div>

              <div className="flex justify-between">
                <span>Mode de paiement:</span>
                <span className="font-medium">
                {printPaymentMethodName()}
              </span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Montant total:</span>
                  <span>{calculateTotal().toFixed(2)} TND</span>
                </div>
                {subscriptionPeriod === SubscriptionPeriod.SIX_MONTHS && (
                  <p className="text-sm text-green-600 mt-1">
                    Vous économisez {(selectedProducts.reduce((sum, id) => {
                    const product = products.find(p => p.id === id);
                    return sum + (product ? product.price * 6 * 0.05 : 0);
                  }, 0)).toFixed(2)} TND avec un abonnement de 6 mois!
                  </p>
                )}
                {subscriptionPeriod === SubscriptionPeriod.ONE_YEAR && (
                  <p className="text-sm text-green-600 mt-1">
                    Vous économisez {(selectedProducts.reduce((sum, id) => {
                    const product = products.find(p => p.id === id);
                    return sum + (product ? product.price * 12 * 0.1 : 0);
                  }, 0)).toFixed(2)} TND avec un abonnement de 1 an!
                  </p>
                )}
                {subscriptionPeriod === SubscriptionPeriod.TWO_YEARS && (
                  <p className="text-sm text-green-600 mt-1">
                    Vous économisez {(selectedProducts.reduce((sum, id) => {
                    const product = products.find(p => p.id === id);
                    return sum + (product ? product.price * 24 * 0.2 : 0);
                  }, 0)).toFixed(2)} TND avec un abonnement de 2 ans!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Confirmer l'abonnement
            </button>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
