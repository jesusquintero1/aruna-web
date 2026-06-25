import { verifySession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-cream md:flex">
      <AdminSidebar username={session.username} />
      <div className="flex-grow min-w-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
