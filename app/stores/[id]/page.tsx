"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState("Standard");
  const [upgradeDuration, setUpgradeDuration] = useState(1);
  const [upgrading, setUpgrading] = useState(false);

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

  async function handleProvisionDomain() {
    if (!store) return;
    if (!confirm(`Re-provision Cloudflare DNS + Vercel domain for ${store.subdomain}.shopsofly.com?`)) return;
    setActing(true);
    try {
      const data: any = await api.provisionDomain(Number(params.id));
      showToast(data.success ? `Domain provisioned: ${data.subdomain}` : `Failed: ${data.error}`);
      const refreshed: any = await api.getStore(Number(params.id));
      setStore(refreshed.store);
    } catch { showToast("Provisioning failed. Check env vars on Koyeb."); }
    finally { setActing(false); }
  }

  async function handleUpgrade() {
    const subId = store?.merchant?.subscription_id;
    if (!subId) { showToast("No subscription found for this store."); return; }
    if (!confirm(`Upgrade to ${upgradePlan} for ${upgradeDuration} month(s)?`)) return;
    setUpgrading(true);
    try {
      const data: any = await api.upgradeSubscription(subId, upgradePlan, upgradeDuration);
      showToast(data.message || "Upgraded successfully!");
      setShowUpgrade(false);
      const refreshed: any = await api.getStore(Number(params.id));
      setStore(refreshed.store);
    } catch { showToast("Upgrade failed. Try again."); }
    finally { setUpgrading(false); }
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
    <AdminLayout>
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
            <button onClick={handleProvisionDomain} disabled={acting}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors">
              {acting ? "Processing..." : "⟳ Re-provision Domain"}
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

        {/* Upgrade Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Subscription & Plan</h2>
            <button onClick={() => setShowUpgrade(!showUpgrade)}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#4A7C59] hover:bg-[#2D4A32] text-white">
              {showUpgrade ? "Cancel" : "⬆ Upgrade Plan"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Plan</p>
              <p className="font-semibold text-gray-900">{store.merchant?.plan || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <p className="font-semibold text-gray-900">{store.merchant?.status || "—"}</p>
            </div>
          </div>
          {showUpgrade && (
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Basic", "Standard", "Trial"].map(p => (
                    <button key={p} onClick={() => setUpgradePlan(p)}
                      className={"py-2.5 rounded-xl text-sm font-semibold border-2 transition-all " + (upgradePlan === p ? "border-[#4A7C59] bg-[#E8F0E9] text-[#4A7C59]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {p}
                      <div className="text-xs font-normal mt-0.5">{p === "Basic" ? "₦5,500/mo" : p === "Standard" ? "₦12,500/mo" : "Free"}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{m:1,l:"1 Month"},{m:3,l:"3 Months"},{m:6,l:"6 Months"},{m:12,l:"1 Year"}].map(d => (
                    <button key={d.m} onClick={() => setUpgradeDuration(d.m)}
                      className={"py-2.5 rounded-xl text-sm font-semibold border-2 transition-all " + (upgradeDuration === d.m ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm">
                <p className="font-semibold text-gray-900">Summary: {upgradePlan} plan for {upgradeDuration} month(s)</p>
                <p className="text-gray-500 text-xs mt-1">This will immediately activate the plan and extend the subscription period.</p>
              </div>
              <button onClick={handleUpgrade} disabled={upgrading}
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">
                {upgrading ? "Upgrading..." : `Confirm Upgrade to ${upgradePlan} — ${upgradeDuration} Month(s)`}
              </button>
            </div>
          )}
        </div>

        {/* Upgrade Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Subscription & Plan</h2>
              <p className="text-sm text-gray-500 mt-1">Current: <strong>{store.merchant?.plan || "—"}</strong> · Status: <strong>{store.merchant?.status || "—"}</strong></p>
            </div>
            <button onClick={() => setShowUpgrade(!showUpgrade)}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#4A7C59] hover:bg-[#2D4A32] text-white transition-colors">
              {showUpgrade ? "Cancel" : "⬆ Upgrade Plan"}
            </button>
          </div>
          {showUpgrade && (
            <div className="border-t border-gray-100 pt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Select Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{n:"Basic",p:"₦5,500/mo"},{n:"Standard",p:"₦12,500/mo"},{n:"Trial",p:"Free"}].map(pl => (
                    <button key={pl.n} onClick={() => setUpgradePlan(pl.n)}
                      className={"py-3 rounded-xl text-sm font-semibold border-2 transition-all " + (upgradePlan === pl.n ? "border-[#4A7C59] bg-[#E8F0E9] text-[#4A7C59]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {pl.n}
                      <div className="text-xs font-normal mt-0.5 opacity-70">{pl.p}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{m:1,l:"1 Month"},{m:3,l:"3 Months"},{m:6,l:"6 Months"},{m:12,l:"1 Year"}].map(d => (
                    <button key={d.m} onClick={() => setUpgradeDuration(d.m)}
                      className={"py-3 rounded-xl text-sm font-semibold border-2 transition-all " + (upgradeDuration === d.m ? "border-[#F97316] bg-orange-50 text-[#F97316]" : "border-gray-200 text-gray-600 hover:border-gray-300")}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
                <p className="font-semibold text-blue-900">Summary: {upgradePlan} plan · {upgradeDuration} month(s)</p>
                <p className="text-blue-600 text-xs mt-1">This immediately activates the plan and extends the subscription period.</p>
              </div>
              <button onClick={handleUpgrade} disabled={upgrading}
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-60 transition-colors">
                {upgrading ? "Upgrading..." : `Confirm — Upgrade to ${upgradePlan} for ${upgradeDuration} Month(s)`}
              </button>
            </div>
          )}
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
    </AdminLayout>
  );
}
