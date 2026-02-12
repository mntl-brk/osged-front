import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   await requireAdmin()

  return <div className="bg-gray-50">{children}</div>
}
