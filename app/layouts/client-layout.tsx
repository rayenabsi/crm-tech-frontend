"use client";

import {ReactNode} from "react";
import Link from "next/link";

export default function ClientLayout({children}: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Bienvenue</h2>
        <ul className="space-y-2">
          <li><Link href="/client/abonnements">📑 Mes abonnements</Link></li>
          <li className="mt-10"><Link href="/login">🔒 Se déconnecter</Link></li>
        </ul>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
