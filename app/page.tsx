"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("operator_token");
    router.push(token ? "/dashboard" : "/login");
  }, []);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  );
}
