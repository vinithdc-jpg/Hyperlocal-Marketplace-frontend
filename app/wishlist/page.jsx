'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/api';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}

function WishlistContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist().then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistService.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
  });

  const items = data?.wishlist || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="relative">
              <ProductCard product={item.productId} />
              <button
                onClick={() => removeMutation.mutate(item.productId._id)}
                className="absolute top-2 right-2 p-2 bg-card rounded-full shadow hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Your wishlist is empty</p>
        </div>
      )}
    </div>
  );
}
