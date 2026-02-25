import { requireAdmin } from "@/lib/auth";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   await requireAdmin()

  return <div className="bg-gray-50">
     <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  </div>
}
