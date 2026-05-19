import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <AdminSidebar />
      <main className="px-4 py-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}
