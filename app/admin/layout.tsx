"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isVendedor, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (!isAdmin && !isVendedor))) {
      router.push("/login?redirect=/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, isVendedor, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isVendedor)) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:pl-64">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
