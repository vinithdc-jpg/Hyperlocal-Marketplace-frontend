'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { productService } from '@/services/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Eye, Heart, Package, Plus, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => productService.getMyProducts().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-products']);
      toast.success('Product deleted');
    },
  });

  const soldMutation = useMutation({
    mutationFn: (id) => productService.markAsSold(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-products']);
      toast.success('Marked as sold');
    },
  });

  const stats = data?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link href="/product/create"><Button><Plus className="w-4 h-4" /> New Listing</Button></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: stats.totalListings || 0, icon: Package, color: 'text-blue-500' },
          { label: 'Total Views', value: stats.totalViews || 0, icon: Eye, color: 'text-green-500' },
          { label: 'Wishlist Saves', value: stats.totalFavorites || 0, icon: Heart, color: 'text-red-500' },
          { label: 'Sold Products', value: stats.soldProducts || 0, icon: CheckCircle, color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
      ) : data?.products?.length ? (
        <div className="space-y-4">
          {data.products.map((p) => (
            <div key={p._id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className="w-20 h-20 rounded-lg bg-background overflow-hidden flex-shrink-0">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${p._id}`} className="font-semibold hover:text-primary truncate block">{p.title}</Link>
                <p className="text-primary font-bold">{formatPrice(p.price)}</p>
                <div className="flex gap-3 text-xs text-muted mt-1">
                  <span>{p.views} views</span>
                  <span>{p.favorites} saves</span>
                  <span className={p.status === 'sold' ? 'text-red-500' : 'text-green-500'}>{p.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {p.status === 'available' && (
                  <Button variant="secondary" size="sm" onClick={() => soldMutation.mutate(p._id)}>Mark Sold</Button>
                )}
                <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(p._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No listings yet</p>
          <Link href="/product/create" className="text-primary hover:underline mt-2 inline-block">Create your first listing</Link>
        </div>
      )}
    </div>
  );
}
