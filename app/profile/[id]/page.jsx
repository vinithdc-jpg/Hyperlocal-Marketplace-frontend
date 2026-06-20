'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api';
import ProductCard from '@/components/products/ProductCard';
import { Star, Package, ShoppingBag } from 'lucide-react';

export default function PublicProfilePage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => userService.getProfile(id).then((r) => r.data),
  });

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (!data?.user) return <div className="text-center py-20">User not found</div>;

  const { user, products, reviews } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            user.name?.[0]
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="flex items-center gap-1 text-muted">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {user.rating} ({user.ratingCount || 0} reviews)
          </p>
          <div className="flex gap-4 mt-2 text-sm text-muted">
            <span className="flex items-center gap-1"><Package className="w-4 h-4" />{user.productsListed} listed</span>
            <span className="flex items-center gap-1"><ShoppingBag className="w-4 h-4" />{user.productsSold} sold</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Listings</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {products?.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>

      {reviews?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{r.buyerId?.name}</span>
                  <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-muted text-sm">{r.review || 'No comment'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
