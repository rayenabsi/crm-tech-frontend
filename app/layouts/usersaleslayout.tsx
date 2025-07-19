"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function UserSalesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-700 mb-8 text-center">🧑‍💼 Sales Panel</h2>
          <nav className="space-y-4">
            <Link href="/sales/clients" className="block text-gray-700 font-medium hover:text-blue-600 transition">
              📋 Gérer les Clients
            </Link>
            <Link href="/sales/abonnements" className="block text-gray-700 font-medium hover:text-blue-600 transition">
              📦 Abonnements
            </Link>
          </nav>
        </div>
        <div className="mt-10 border-t pt-4">
          <Link href="/login" className="block text-red-500 font-semibold hover:text-red-700 transition">
            🔒 Se déconnecter
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700">📊 Tableau de bord - User Sales</h1>
        </header>
        <section className="bg-white p-6 rounded-lg shadow">{children}</section>
      </main>
    </div>
  );
}
