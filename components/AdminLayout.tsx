"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: "📊", href: "/dashboard" },
  { label: "Stores", icon: "🏪", href: "/stores" },
  { label: "Merchants", icon: "👤", href: "/merchants" },
  { label: "Subscriptions", icon: "💳", href: "/subscriptions" },
  { label: "Messages", icon: "📩", href: "/messages" },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/stores": "Stores",
  "/merchants": "Merchants",
  "/subscriptions": "Subscriptions",
  "/messages": "Messages",
};

function DesktopSidebar({ router }: any) {
  return (
    <div className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col fixed h-full z-10">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">Shopsofly Admin</p>
            <p className="text-gray-600 text-xs">QuickDev Africa</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
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

function MobileHeader({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSubPage = pathname.split("/").filter(Boolean).length > 1;
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 gap-3">
      {isSubPage ? (
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 text-lg">
          ←
        </button>
      ) : (
        <span className="text-xl">🛡️</span>
      )}
      <div className="flex-1">
        <h1 className="font-bold text-gray-900 text-base">{title}</h1>
        <p className="text-xs text-gray-400">Shopsofly Admin</p>
      </div>
    </header>
  );
}

function MobileBottomNav({ router }: any) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const primaryNav = navItems.slice(0, 4);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {primaryNav.map((item) => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive(item.href) ? "text-gray-900" : "text-gray-400"}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive(item.href) && <div className="absolute top-0 w-8 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
          <button onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-400">
            <span className="text-xl">⋯</span>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">Navigation</p>
              {navItems.map((item) => (
                <button key={item.href} onClick={() => { router.push(item.href); setShowMore(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive(item.href) ? "bg-gray-100 text-gray-900" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button onClick={() => { localStorage.removeItem("operator_token"); router.push("/login"); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600">
                <span>🚪</span> Sign Out
              </button>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = title || pageTitles[pathname] || pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k + "/")) || ""] || "Admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DesktopSidebar router={router} />
      <MobileHeader title={pageTitle} />
      <div className="md:ml-56 flex-1 pt-14 md:pt-0 pb-20 md:pb-0">
        {children}
      </div>
      <MobileBottomNav router={router} />
    </div>
  );
}
