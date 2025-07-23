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
import ClientLayout from "@/app/layouts/client-layout";
import Link from "next/link";

export default function ClientSubscriptionDetailsPage({params}: { params: { id: string } }) {

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      <ClientLayout>
        <div className="max-w-6xl mx-auto p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => router.push("/client/abonnements")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Retour à mes abonnements
          </button>
        </div>
      </ClientLayout>
    );
  }

  if (!subscription) {
    return (
      <ClientLayout>
        <div className="max-w-6xl mx-auto p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Abonnement non trouvé</h2>
          <Link
            href="/client/abonnements"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
          >
            Retour à mes abonnements
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Détails de l'abonnement</h1>
            <p className="text-gray-600">ID: {subscription.id}</p>
          </div>
          <button
            onClick={() => router.push("/client/abonnements")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* En-tête */}
          <div className="bg-blue-50 p-6 border-b">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{subscription.provider.name}</h2>
                <p className="text-gray-600">
                  {subscription.products.length} produit(s) • {printSubscriptionPeriodName(subscription.period)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === SubscriptionStatus.ACTIVE ? "bg-green-100 text-green-800"
                    : subscription.status === SubscriptionStatus.WAITING_FOR_PAYMENT ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"}`}>
                        {printSubscriptionStatus(subscription.status)}
                      </span>
                <div className="text-right">
                <span className="text-2xl font-bold">
                  {subscription.billing.amount.toFixed(2)}
                </span>
                  <span className="text-gray-500 ml-1">
                  {subscription.billing.currency}/{printSubscriptionPeriodName(subscription.period)}
                </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations de facturation</h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-gray-500">Date de début:</span>
                  <span>{formatDate(subscription.startDate)}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-gray-500">Date d'éxpiration:</span>
                  <span>{formatDate(subscription.endDate)}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-gray-500">Mode de paiement:</span>
                  <span>{printPaymentMethodName(subscription.billing.paymentMethod)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => console.log("Modifier l'abonnement")}
                  className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded"
                >
                  Modifier l'abonnement
                </button>
                <button
                  onClick={() => console.log("Changer le mode de paiement")}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded"
                >
                  Changer le mode de paiement
                </button>
                {subscription.status === SubscriptionStatus.ACTIVE ? (
                  <button
                    onClick={() => console.log("Annuler l'abonnement")}
                    className="w-full text-left bg-red-50 hover:bg-red-100 text-red-700 py-2 px-4 rounded"
                  >
                    Annuler l'abonnement
                  </button>
                ) : (
                  <button
                    onClick={() => console.log("Réactiver l'abonnement")}
                    className="w-full text-left bg-green-50 hover:bg-green-100 text-green-700 py-2 px-4 rounded"
                  >
                    Réactiver l'abonnement
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Produits inclus</h3>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description || "Aucune description"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.price.toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {printSubscriptionPeriodName(subscription.period)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    {subscription.billing.amount.toFixed(2)} TND
                  </td>
                </tr>
                {subscription.period === SubscriptionPeriod.SIX_MONTHS && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium">
                      Économies ({printSubscriptionPeriodName(subscription.period)}):
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                      {((subscription.billing.amount * 5) / 95).toFixed(2)} TND
                    </td>
                  </tr>
                )}
                {subscription.period === SubscriptionPeriod.ONE_YEAR && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium">
                      Économies ({printSubscriptionPeriodName(subscription.period)}):
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                      {((subscription.billing.amount * 10) / 90).toFixed(2)} TND
                    </td>
                  </tr>
                )}
                {subscription.period === SubscriptionPeriod.TWO_YEARS && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium">
                      Économies ({printSubscriptionPeriodName(subscription.period)}):
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">
                      {((subscription.billing.amount * 20) / 80).toFixed(2)} TND
                    </td>
                  </tr>
                )}
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </div>
    </ClientLayout>
  );
}
