// app/layouts/AdminLayout.tsx
"use client";
import {ReactNode} from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li><Link href="/admin/clients">📋 Clients</Link></li>
          <li><Link href="/admin/produits">📦 Produits</Link></li>
          <li><Link href="/admin/fournisseurs">🏭 Fournisseurs</Link></li>
          <li><Link href="/admin/abonnements">📑 Abonnements</Link></li>
          <li><Link href="/admin/users">👥 Utilisateurs</Link></li>
        </ul>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
