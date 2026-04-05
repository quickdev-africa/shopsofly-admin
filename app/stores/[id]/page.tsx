"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getStore(Number(params.id)).then((data: any) => {
      setStore(data.store);
      setLoading(false);
    }).catch(() => router.push("/stores"));
  }, [router, params.id]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function handleDelete() {
    if (!store) return;
    if (!confirm(`PERMANENTLY DELETE "${store.name}"?\n\nThis will delete ALL data including:\n• All products\n• All orders\n• All customers\n• The subdomain ${store.subdomain}.shopsofly.com\n\nThis CANNOT be undone. Type the store name to confirm.`)) return;
    const typed = prompt(`Type "${store.name}" to confirm deletion:`);
    if (typed !== store.name) { showToast("Store name did not match. Deletion cancelled."); return; }
    setActing(true);
    try {
      await api.deleteStore(Number(params.id));
      showToast("Store deleted permanently.");
      setTimeout(() => router.push("/stores"), 2000);
    } catch { showToast("Failed to delete. Try again."); }
    finally { setActing(false); }
  }

  async function toggleActive() {
    if (!store) return;
    const action = store.active ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} this store?`)) return;
    setActing(true);
    try {
      await api.updateStore(Number(params.id), { active: !store.active });
      showToast(`Store ${action}d successfully.`);
      const data: any = await api.getStore(Number(params.id));
      setStore(data.store);
    } catch { showToast("Failed. Try again."); }
    finally { setActing(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Loading...</p>
    </div>
  );
  if (!store) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push("/stores")} className="text-gray-400 hover:text-gray-600 text-sm">← Stores</button>
        <h1 className="text-xl font-bold text-gray-900">Store Detail</h1>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Store Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Store Information</h2>
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Store Name</p>
              <p className="font-semibold text-gray-900">{store.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">URL</p>
              <a href={"https://" + store.subdomain + ".shopsofly.com"} target="_blank"
                className="font-semibold text-blue-600 hover:underline">{store.subdomain}.shopsofly.com</a>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Currency</p>
              <p className="font-semibold text-gray-900">{store.currency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (store.active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {store.active !== false ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Orders</p>
              <p className="font-semibold text-gray-900">{store.orders_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revenue</p>
              <p className="font-semibold text-green-600">₦{(store.revenue || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Products</p>
              <p className="font-semibold text-gray-900">{store.products_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Merchant</p>
              <p className="font-semibold text-gray-900">{store.merchant?.email || "—"}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 text-lg">Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <button onClick={toggleActive} disabled={acting}
              className={"text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-60 transition-colors " + (
                store.active !== false
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}>
              {acting ? "Processing..." : store.active !== false ? "✕ Deactivate Store" : "✓ Activate Store"}
            </button>
            <a href={"https://" + store.subdomain + ".shopsofly.com"} target="_blank"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700">
              Visit Store →
            </a>
            <button onClick={handleDelete} disabled={acting}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-700 text-white disabled:opacity-60 transition-colors">
              🗑️ Delete Store Permanently
            </button>
          </div>
        </div>

        {/* Delete warning */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 text-sm font-semibold mb-1">⚠️ Danger Zone</p>
          <p className="text-red-600 text-xs">Permanently deleting a store removes all data including products, orders, customers, and the subdomain. This cannot be undone.</p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
