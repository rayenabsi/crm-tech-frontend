"use client";

import {useEffect, useState} from "react";
import {
  PaymentMethod,
  Subscription,
  SubscriptionPeriod,
  SubscriptionStatus
} from "@/app/core/models/subscription.model";
import {useRouter} from "next/navigation";
import {getSubscriptionById} from "@/app/core/services/subscription.service";
import Link from "next/link";
import AdminLayout from "@/app/layouts/adminlayout";

export default function SubscriptionDetailsPage({params}: { params: { id: string } }) {

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await getSubscriptionById(Number(params.id));
        setSubscription(data);
      } catch (err) {
        setError("❌ Échec du chargement des détails de l'abonnement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const printSubscriptionStatus = (status: SubscriptionStatus): string => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Actif';
      case SubscriptionStatus.EXPIRED:
        return 'Expiré';
      case SubscriptionStatus.WAITING_FOR_PAYMENT:
        return 'En attente de paiment';
      default:
        return status;
    }
  };

  const printSubscriptionPeriodName = (period: SubscriptionPeriod): string => {
    switch (period) {
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
        return period;
    }
  };

  const printPaymentMethodName = (paymentMethod: PaymentMethod): string => {
    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return 'Carte de crédit/débit';
      case PaymentMethod.PAYPAL:
        return 'PayPal';
      case PaymentMethod.BANK_TRANSFER:
        return 'Virement bancaire';
      default:
        return paymentMethod;
    }
  };

  const printProductTotalAmount = (period: SubscriptionPeriod, productPrice: number): number => {
    switch (period) {
      case SubscriptionPeriod.ONE_MONTH:
        return productPrice;
      case SubscriptionPeriod.THREE_MONTHS:
        return productPrice * 3;
      case SubscriptionPeriod.SIX_MONTHS:
        return productPrice * 6;
      case SubscriptionPeriod.ONE_YEAR:
        return productPrice * 12;
      case SubscriptionPeriod.TWO_YEARS:
        return productPrice * 24;
      default:
        return 0;
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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => router.push("/admin/abonnements")}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
          >
            Retour à la liste
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!subscription) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Abonnement introuvable</h2>
          <Link
            href="/admin/abonnements"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Retour à la liste des abonnements
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Détails de l'abonnement #{subscription.id}</h1>
            <div className="flex items-center mt-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              subscription.status === SubscriptionStatus.ACTIVE ? "bg-green-100 text-green-800"
                : subscription.status === SubscriptionStatus.WAITING_FOR_PAYMENT ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}>
              {printSubscriptionStatus(subscription.status)}
            </span>
              <span className="ml-2 text-sm text-gray-600">
              Créé le {formatDate(subscription.startDate)}
            </span>
            </div>
          </div>
          <Link
            href="/admin/abonnements"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            ← Retour
          </Link>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Paiement
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow overflow-hidden">

          {activeTab === "details" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informations client */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informations client</h2>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-40 text-gray-600">Nom complet:</span>
                      <span className="font-medium">{subscription.user.firstName} {subscription.user.lastName}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Email:</span>
                      <span>{subscription.user.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Téléphone:</span>
                      <span>{subscription.user.phoneNumber || "Non renseigné"}</span>
                    </div>
                    {/*<div className="flex">*/}
                    {/*  <span className="w-40 text-gray-600">Entreprise:</span>*/}
                    {/*  <span>{subscription.client.company || "Particulier"}</span>*/}
                    {/*</div>*/}
                    <div className="flex">
                      <span className="w-40 text-gray-600">ID client:</span>
                      <span>{subscription.user.id}</span>
                    </div>
                  </div>
                </div>

                {/* Informations abonnement */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informations abonnement</h2>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-40 text-gray-600">Fournisseur:</span>
                      <span className="font-medium">{subscription.provider.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Période:</span>
                      <span>{printSubscriptionPeriodName(subscription.period)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Date début:</span>
                      <span>{formatDate(subscription.startDate)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Date éxpiration:</span>
                      <span>{formatDate(subscription.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produits inclus */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Produits inclus</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix par mois</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {subscription.products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description || "Aucune description"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.price.toFixed(2)} TND
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {printSubscriptionPeriodName(subscription.period)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {printProductTotalAmount(subscription.period, product.price).toFixed(2)} TND
                        </td>
                      </tr>
                    ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">
                        {subscription.billing.amount.toFixed(2)} {subscription.billing.currency}
                      </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* payment */}
                <div>
                  <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Informations Paiement</h2>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-40 text-gray-600">Prix Total:</span>
                      <span>{subscription.billing.amount.toFixed(2)} {subscription.billing.currency}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Date paiement:</span>
                      <span>{formatDate(subscription.billing.paymentDate)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-40 text-gray-600">Mode paiement:</span>
                      <span>{printPaymentMethodName(subscription.billing.paymentMethod)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Actions administratives */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions administratives</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => console.log("Modifier l'abonnement")}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded"
            >
              Modifier
            </button>
            {subscription.status === SubscriptionStatus.ACTIVE ? (
              <button
                onClick={() => console.log("Suspendre l'abonnement")}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 px-4 rounded"
              >
                Suspendre
              </button>
            ) : (
              <button
                onClick={() => console.log("Réactiver l'abonnement")}
                className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded"
              >
                Réactiver
              </button>
            )}
            <button
              onClick={() => console.log("Renvoyer les accès")}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded"
            >
              Renvoyer les accès
            </button>
            <button
              onClick={() => console.log("Contacter le client")}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded"
            >
              Contacter le client
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
