"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function Sidebar({ router }: any) {
  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Shopsofly Admin</p>
            <p className="text-gray-400 text-xs">QuickDev Africa</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {[
          { label: "Dashboard", icon: "📊", href: "/dashboard" },
          { label: "Stores", icon: "🏪", href: "/stores" },
          { label: "Merchants", icon: "👤", href: "/merchants" },
          { label: "Subscriptions", icon: "💳", href: "/subscriptions" },
        ].map((item) => (
          <button key={item.href} onClick={() => router.push(item.href)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium w-full text-left">
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200">
        <button onClick={() => { localStorage.removeItem("operator_token"); router.push("/login"); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 text-sm font-medium w-full">
          <span>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    Promise.all([api.dashboard(), api.getStores()])
      .then(([d, s]: any[]) => { setSummary(d.summary); setStores(s.stores || []); setLoading(false); })
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const stats = [
    { icon: "🏪", label: "Total Stores", value: summary?.total_stores || 0, color: "" },
    { icon: "👤", label: "Merchants", value: summary?.total_merchants || 0, color: "" },
    { icon: "📦", label: "Total Orders", value: summary?.total_orders || 0, color: "" },
    { icon: "🛍️", label: "Products", value: summary?.total_products || 0, color: "" },
    { icon: "💰", label: "Revenue", value: "₦" + (summary?.total_revenue || 0).toLocaleString(), color: "bg-green-50" },
    { icon: "✨", label: "New Stores Today", value: summary?.new_stores_today || 0, color: "bg-blue-50" },
    { icon: "🛒", label: "New Orders Today", value: summary?.new_orders_today || 0, color: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar router={router} />
      <div className="ml-56 flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className={"rounded-2xl border border-gray-200 p-5 shadow-sm " + (s.color || "bg-white")}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">All Stores</h2>
            <button onClick={() => router.push("/stores")} className="text-sm text-blue-500 font-medium">View All →</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>{["Store","Subdomain","Orders","Revenue","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {stores.map((s: any) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => router.push("/stores/" + s.id)}>
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.subdomain}.shopsofly.com</td>
                    <td className="px-4 py-3 text-sm">{s.orders_count || 0}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">₦{(s.revenue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (s.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {s.active !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
