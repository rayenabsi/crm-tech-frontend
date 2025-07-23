"use client";

import {useEffect, useState} from "react";
import {Subscription, SubscriptionPeriod, SubscriptionStatus} from "@/app/core/models/subscription.model";
import {getSubscriptionsByUser} from "@/app/core/services/subscription.service";
import ClientLayout from "@/app/layouts/client-layout";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function ClientSubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clientId = typeof window !== "undefined" ? Number(localStorage.getItem("crm_tech_user_id")) : null;

  useEffect(() => {
    const fetchClientSubscriptions = async () => {
      try {
        const data = await getSubscriptionsByUser(clientId!);
        setSubscriptions(data);
      } catch (err) {
        setError("❌ Échec du chargement des abonnements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientSubscriptions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getNextBillingDate = (lastBillingDate: string, period: SubscriptionPeriod) => {
    const date = new Date(lastBillingDate);
    if (period === SubscriptionPeriod.ONE_MONTH) {
      date.setMonth(date.getMonth() + 1);
    } else if (period === SubscriptionPeriod.THREE_MONTHS) {
      date.setMonth(date.getMonth() + 3);
    } else if (period === SubscriptionPeriod.SIX_MONTHS) {
      date.setMonth(date.getMonth() + 6);
    } else if (period === SubscriptionPeriod.ONE_YEAR) {
      date.setFullYear(date.getFullYear() + 1);
    } else if (period === SubscriptionPeriod.TWO_YEARS) {
      date.setFullYear(date.getFullYear() + 2);
    }
    return formatDate(date.toISOString());
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
        return '';
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
        return '';
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mes abonnements</h1>
          <button
            onClick={() => router.push("/client/abonnements/nouvel")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            + Nouvel abonnement
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Aucun abonnement trouvé</h2>
            <p className="text-gray-600 mb-6">Vous n'avez encore aucun abonnement actif.</p>
            <Link
              href="/client/abonnements/nouvel"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
            >
              Créez votre premier abonnement
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{subscription.provider.name}</h2>
                    <p className="text-gray-600 mb-4">
                      {subscription.products.length} produit(s) • {printSubscriptionPeriodName(subscription.period)}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="w-32 text-gray-500">Status:</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          subscription.status === SubscriptionStatus.ACTIVE ? "bg-green-100 text-green-800"
                            : subscription.status === SubscriptionStatus.WAITING_FOR_PAYMENT ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                        {printSubscriptionStatus(subscription.status)}
                      </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-500">Date de début:</span>
                        <span>{formatDate(subscription.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-32 text-gray-500">Date d'éxpiration:</span>
                        <span>{formatDate(subscription.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <div className="text-2xl font-bold mb-2">
                      {subscription.billing.amount.toFixed(2)}
                      <span className="text-lg font-normal text-gray-500 ml-1">
                       {subscription.billing.currency}/{printSubscriptionPeriodName(subscription.period)}
                    </span>
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => router.push(`/client/abonnements/${subscription.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Voir les détails
                      </button>
                      <button
                        onClick={() => console.log("Manage clicked", subscription.id)}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Gérer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products preview */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Produits inclus dans cet abonnement:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subscription.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.price.toFixed(2)} TND/mois</p>
                      </div>
                    ))}
                    {subscription.products.length > 3 && (
                      <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-500">
                        +{subscription.products.length - 3} plus
                      </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
