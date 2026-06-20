'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Users, Package, ShoppingBag, Flag, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/');
  }, [user, router]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminService.getStats().then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers().then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.getProducts().then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const { data: reportsData } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminService.getReports().then((r) => r.data),
    enabled: user?.role === 'admin',
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-users']); toast.success('User deleted'); },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => adminService.deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-products']); toast.success('Product removed'); },
  });

  const resolveReportMutation = useMutation({
    mutationFn: ({ id, removeProduct }) => adminService.resolveReport(id, { status: 'resolved', removeProduct }),
    onSuccess: () => { queryClient.invalidateQueries(['admin-reports']); toast.success('Report resolved'); },
  });

  if (user?.role !== 'admin') return null;

  const s = stats?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Total Users', value: s.totalUsers, icon: Users },
          { label: 'Total Products', value: s.totalProducts, icon: Package },
          { label: 'Active Listings', value: s.activeListings, icon: ShoppingBag },
          { label: 'Pending Reports', value: s.pendingReports, icon: Flag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-6 rounded-xl border border-border bg-card">
            <Icon className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-muted">{label}</p>
            <p className="text-3xl font-bold">{value || 0}</p>
          </div>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users?.map((u) => (
                <tr key={u._id} className="border-t border-border">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3 text-muted">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-center">
                    <Button variant="danger" size="sm" onClick={() => deleteUserMutation.mutate(u._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <div className="space-y-2">
          {productsData?.products?.slice(0, 10).map((p) => (
            <div key={p._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-muted">by {p.seller?.name}</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => deleteProductMutation.mutate(p._id)}>Remove</Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Reports</h2>
        <div className="space-y-3">
          {reportsData?.reports?.map((r) => (
            <div key={r._id} className="p-4 rounded-xl border border-border bg-card">
              <p className="font-medium">{r.product?.title}</p>
              <p className="text-sm text-muted">Reported by {r.reporter?.name}: {r.reason}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => resolveReportMutation.mutate({ id: r._id, removeProduct: false })}>Dismiss</Button>
                <Button variant="danger" size="sm" onClick={() => resolveReportMutation.mutate({ id: r._id, removeProduct: true })}>Remove Listing</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
