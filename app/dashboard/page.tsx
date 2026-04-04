"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function StatCard({ icon, label, value, color = "bg-gray-800" }: any) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-gray-700`}>
      <div className="text-2xl mb-3">{icon}</div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [operator, setOperator] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    const op = localStorage.getItem("operator");
    if (!token) { router.push("/login"); return; }
    if (op) setOperator(JSON.parse(op));

    Promise.all([api.dashboard(), api.getStores()])
      .then(([dashData, storesData]: any[]) => {
        setSummary(dashData.summary);
        setStores(storesData.stores || []);
        setLoading(false);
      })
      .catch(() => { router.push("/login"); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white text-lg">Loading platform data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="font-bold text-lg">Shopsofly Admin</h1>
            <p className="text-gray-400 text-xs">Welcome, {operator?.name || "Operator"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/stores")}
            className="text-sm text-gray-300 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg">
            All Stores
          </button>
          <button onClick={() => { localStorage.removeItem("operator_token"); router.push("/login"); }}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg">
            Sign Out
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon="🏪" label="Total Stores" value={summary?.total_stores || 0} />
          <StatCard icon="👤" label="Merchants" value={summary?.total_merchants || 0} />
          <StatCard icon="📦" label="Total Orders" value={summary?.total_orders || 0} />
          <StatCard icon="🛍️" label="Products" value={summary?.total_products || 0} />
          <StatCard icon="💰" label="Total Revenue" value={"₦" + (summary?.total_revenue || 0).toLocaleString()} color="bg-green-900" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <StatCard icon="✨" label="New Stores Today" value={summary?.new_stores_today || 0} color="bg-blue-900" />
          <StatCard icon="🛒" label="New Orders Today" value={summary?.new_orders_today || 0} color="bg-orange-900" />
        </div>

        {/* Stores Table */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Stores</h2>
          <button onClick={() => router.push("/stores")}
            className="text-sm text-blue-400 hover:text-blue-300">View All →</button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-800">
              <tr>
                {["Store", "Subdomain", "Products", "Orders", "Revenue", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map((store: any) => (
                <tr key={store.id} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => router.push(`/stores/${store.id}`)}>
                  <td className="px-4 py-3 text-sm font-medium">{store.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{store.subdomain}.shopsofly.com</td>
                  <td className="px-4 py-3 text-sm">{store.products_count || 0}</td>
                  <td className="px-4 py-3 text-sm">{store.orders_count || 0}</td>
                  <td className="px-4 py-3 text-sm text-green-400">₦{(store.revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (
                      store.active !== false ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                    )}>
                      {store.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
