import { CompanySidebar } from "@/components/layout/company-sidebar";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <CompanySidebar />
      <main className="min-w-0 overflow-x-hidden px-4 py-6 lg:ml-72 lg:px-8">{children}</main>
    </div>
  );
}
