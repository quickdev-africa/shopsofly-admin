"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getStores().then((data: any) => {
      setStores(data.stores || []);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</button>
        <h1 className="text-xl font-bold text-gray-900">All Stores</h1>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">{stores.length}</span>
      </div>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Store", "Subdomain", "Products", "Orders", "Revenue", "Status", "Created", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={"https://" + s.subdomain + ".shopsofly.com"} target="_blank"
                      className="text-blue-500 hover:underline text-sm">{s.subdomain}.shopsofly.com</a>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.products_count || 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{s.orders_count || 0}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">₦{(s.revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (
                      s.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {s.active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => router.push("/stores/" + s.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700">
                      View
                    </button>
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
