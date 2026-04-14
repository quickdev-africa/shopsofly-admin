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

  // Update email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Record payment form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

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
    setTimeout(() => setToast(""), 4000);
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

  async function handleResendWelcome() {
    if (!confirm(`Send password setup email to ${merchant?.email}?`)) return;
    setActing(true);
    try {
      await api.resendWelcomeEmail(Number(params.id));
      showToast(`Password setup email sent to ${merchant?.email}`);
    } catch { showToast("Failed to send email. Try again."); }
    finally { setActing(false); }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    if (!confirm(`Change merchant email to "${newEmail}"?\n\nThis updates their login email. Send password setup email after.`)) return;
    setActing(true);
    try {
      await api.updateMerchantEmail(Number(params.id), newEmail.trim());
      showToast(`Email updated to ${newEmail}. Send them the password setup email now.`);
      const data: any = await api.getMerchant(Number(params.id));
      setMerchant(data.merchant);
      setNewEmail("");
      setShowEmailForm(false);
    } catch (err: any) { showToast("Failed to update email. " + (err?.message || "")); }
    finally { setActing(false); }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) { showToast("Enter a valid amount."); return; }
    if (!confirm(`Record manual payment of ₦${amount.toLocaleString()} for ${merchant?.email}?`)) return;
    setActing(true);
    try {
      await api.recordPayment(Number(params.id), amount, paymentNote);
      showToast(`Payment of ₦${amount.toLocaleString()} recorded.`);
      setPaymentAmount("");
      setPaymentNote("");
      setShowPaymentForm(false);
    } catch { showToast("Failed to record payment. Try again."); }
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
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
              <p className="font-semibold text-gray-900">{merchant.email}</p>
            </div>
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

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap mb-4">
            <button onClick={handleResendWelcome} disabled={acting}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
              ✉ Send Password Setup Email
            </button>
            <button onClick={() => { setShowEmailForm(!showEmailForm); setShowPaymentForm(false); }} disabled={acting}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
              ✎ Correct Email Address
            </button>
            <button onClick={() => { setShowPaymentForm(!showPaymentForm); setShowEmailForm(false); }} disabled={acting}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-60">
              ₦ Record Payment
            </button>
          </div>

          {/* Correct Email Form */}
          {showEmailForm && (
            <form onSubmit={handleUpdateEmail} className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-purple-800">Correct Merchant Email</p>
              <p className="text-xs text-purple-600">Current: <strong>{merchant.email}</strong> — Updates both login and merchant record. Send password email after.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="correct@email.com"
                  required
                  className="flex-1 border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button type="submit" disabled={acting || !newEmail.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                  {acting ? "Updating..." : "Update Email"}
                </button>
                <button type="button" onClick={() => setShowEmailForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Record Payment Form */}
          {showPaymentForm && (
            <form onSubmit={handleRecordPayment} className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
              <p className="text-sm font-semibold text-green-800">Record Manual Payment</p>
              <p className="text-xs text-green-600">Use to backfill missing payments or record cash/offline payments. This records the amount in revenue.</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-400">₦</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 12500"
                    min="1"
                    required
                    className="w-full border border-green-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button type="submit" disabled={acting || !paymentAmount}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                  {acting ? "Saving..." : "Record"}
                </button>
                <button type="button" onClick={() => setShowPaymentForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Use "Correct Email" if merchant signed up with wrong email — fixes login. Then send password setup email to the new address.
          </p>
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
