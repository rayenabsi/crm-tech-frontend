"use client";

import {useEffect, useState} from "react";
import {Subscription, SubscriptionPeriod, SubscriptionStatus} from "@/app/core/models/subscription.model";
import {getAllSubscriptions} from "@/app/core/services/subscription.service";
import {useRouter} from "next/navigation";
import AdminLayout from "@/app/layouts/adminlayout";

export default function SubscriptionsPage() {

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await getAllSubscriptions();
        setSubscriptions(data);
      } catch (err) {
        setError("❌ Échec du chargement des abonnements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch =
      sub.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const columns = [
    {key: "id", label: "ID"},
    {key: "clientName", label: "Client"},
    {key: "providerName", label: "Fournisseur"},
    {key: "startDate", label: "Date début"},
    {key: "nextBilling", label: "Date expiration"},
    {key: "amount", label: "Montant"},
    {key: "status", label: "Statut"},
    {key: "actions", label: "Actions"}
  ];

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
          <h1 className="text-3xl font-bold">📑 Gestion des Abonnements Clients</h1>
          {/*<Link*/}
          {/*  href="/admin/subscriptions/create"*/}
          {/*  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"*/}
          {/*>*/}
          {/*  + Créer un abonnement*/}
          {/*</Link>*/}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                type="text"
                placeholder="Rechercher par client, fournisseur ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 border rounded"
              >
                <option value="all">Tous les statuts</option>
                <option value={SubscriptionStatus.ACTIVE}>Actif</option>
                <option value={SubscriptionStatus.WAITING_FOR_PAYMENT}>En attente de paiment</option>
                <option value="canceled">Annulé</option>
                <option value={SubscriptionStatus.EXPIRED}>Expiré</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Abonnements</h3>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Actifs</h3>
            <p className="text-2xl font-bold text-green-600">
              {subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Expirés</h3>
            <p className="text-2xl font-bold text-red-600">
              {subscriptions.filter(s => s.status === SubscriptionStatus.EXPIRED).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Chiffre d'affaires</h3>
            <p className="text-2xl font-bold">
              {subscriptions
                .filter(s => s.status === SubscriptionStatus.ACTIVE)
                .reduce((sum, sub) => sum + sub.billing.amount, 0)
                .toFixed(2)} TND
            </p>
          </div>
        </div>

        {/* Tableau des abonnements */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center">
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.user.firstName} {subscription.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.provider.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.products.length} produit(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subscription.billing.amount.toFixed(2)}
                      <span className="text-gray-500 text-xs block ml-1">
                        {subscription.billing.currency}/{printSubscriptionPeriodName(subscription.period)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscription.status === SubscriptionStatus.ACTIVE ? "bg-green-100 text-green-800"
                          : subscription.status === SubscriptionStatus.WAITING_FOR_PAYMENT ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {printSubscriptionStatus(subscription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/abonnements/${subscription.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Détails
                      </button>
                      <button
                        onClick={() => console.log("Modifier", subscription.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredSubscriptions.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Affichage de <span className="font-medium">1</span> à <span className="font-medium">10</span> sur <span
              className="font-medium">{filteredSubscriptions.length}</span> résultats
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
