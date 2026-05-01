"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>;

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
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className={"rounded-2xl border border-gray-200 p-5 shadow-sm " + (s.color || "bg-white")}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-gray-700 text-sm mt-1">{s.label}</p>
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
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.subdomain}.shopsofly.com</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.orders_count || 0}</td>
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
    </AdminLayout>
  );
}
