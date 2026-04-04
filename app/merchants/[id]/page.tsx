"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    if (!token) { router.push("/login"); return; }
    api.getMerchant(Number(params.id)).then((data: any) => {
      setMerchant(data.merchant);
      setLoading(false);
    }).catch(() => router.push("/merchants"));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleMarkPaid() {
    if (!merchant?.subscription) return;
    setActing(true);
    try {
      await api.markPaid(merchant.subscription.id);
      showToast("Marked as paid. Store reactivated.");
      const data: any = await api.getMerchant(Number(params.id));
      setMerchant(data.merchant);
    } catch { showToast("Failed. Try again."); }
    finally { setActing(false); }
  }

  async function handleSuspend() {
    if (!merchant?.subscription) return;
    if (!confirm("Suspend this merchant? Their store will go offline.")) return;
    setActing(true);
    try {
      await api.suspendSubscription(merchant.subscription.id);
      showToast("Merchant suspended.");
      const data: any = await api.getMerchant(Number(params.id));
      setMerchant(data.merchant);
    } catch { showToast("Failed. Try again."); }
    finally { setActing(false); }
  }

  async function handleReactivate() {
    if (!merchant?.subscription) return;
    setActing(true);
    try {
      await api.reactivateSubscription(merchant.subscription.id);
      showToast("Merchant reactivated.");
      const data: any = await api.getMerchant(Number(params.id));
      setMerchant(data.merchant);
    } catch { showToast("Failed. Try again."); }
    finally { setActing(false); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
  if (!merchant) return null;

  const sub = merchant.subscription;
  const daysLeft = sub?.current_period_ends_at ?
    Math.round((new Date(sub.current_period_ends_at).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/merchants")} className="text-gray-400 hover:text-gray-600">← Back</button>
          <h1 className="text-xl font-bold text-gray-900">Merchant Detail</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Merchant Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Merchant Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p><p className="font-semibold text-gray-900">{merchant.email}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Phone</p><p className="font-semibold text-gray-900">{merchant.phone || "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
              <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (
                merchant.status === "active" ? "bg-green-100 text-green-700" :
                merchant.status === "trial" ? "bg-blue-100 text-blue-700" :
                "bg-red-100 text-red-700"
              )}>{merchant.status}</span>
            </div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Plan</p><p className="font-semibold text-gray-900">{merchant.plan?.name || "—"} {merchant.plan ? `— ₦${merchant.plan.price.toLocaleString()}/mo` : ""}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Trial Ends</p><p className="font-semibold text-gray-900">{merchant.trial_ends_at ? new Date(merchant.trial_ends_at).toLocaleDateString() : "—"}</p></div>
            <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Member Since</p><p className="font-semibold text-gray-900">{new Date(merchant.created_at).toLocaleDateString()}</p></div>
          </div>
        </div>

        {/* Store Info */}
        {merchant.store && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Store</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Store Name</p><p className="font-semibold text-gray-900">{merchant.store.name}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">URL</p>
                <a href={"https://" + merchant.store.subdomain + ".shopsofly.com"} target="_blank"
                  className="text-blue-500 hover:underline font-medium">{merchant.store.subdomain}.shopsofly.com</a>
              </div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Store Status</p>
                <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (merchant.store.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {merchant.store.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription */}
        {sub && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Subscription</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
                <span className={"text-xs font-semibold px-2 py-1 rounded-full " + (
                  sub.status === "active" ? "bg-green-100 text-green-700" :
                  sub.status === "trial" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                )}>{sub.status}</span>
              </div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Period Ends</p>
                <p className={"font-semibold " + (daysLeft !== null && daysLeft < 0 ? "text-red-500" : "text-gray-900")}>
                  {sub.current_period_ends_at ? new Date(sub.current_period_ends_at).toLocaleDateString() : "—"}
                  {daysLeft !== null && (
                    <span className="ml-2 text-xs">({daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`})</span>
                  )}
                </p>
              </div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Failed Attempts</p><p className="font-semibold text-gray-900">{sub.failed_attempts ?? 0}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Last Charge</p><p className="font-semibold text-gray-900">{sub.last_charge_status || "—"}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Payment Ref</p><p className="font-medium text-xs">{sub.payment_reference || "—"}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Grace Period</p>
                <p className={"font-semibold " + (daysLeft !== null && daysLeft < 0 && daysLeft >= -7 ? "text-amber-500" : "text-gray-900")}>
                  {daysLeft !== null && daysLeft < 0 && daysLeft >= -7 ? `${7 + daysLeft} days remaining` :
                   daysLeft !== null && daysLeft < -7 ? "Grace period expired" : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handleMarkPaid} disabled={acting}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
                ✓ Mark as Paid (Manual)
              </button>
              <button onClick={handleReactivate} disabled={acting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
                ↑ Reactivate
              </button>
              <button onClick={handleSuspend} disabled={acting}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
                ✕ Suspend Store
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
