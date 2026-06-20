'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, wishlistService, chatService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useLocationStore } from '@/store/useStore';
import { formatPrice, formatDate } from '@/lib/utils';
import LocationMap from '@/components/map/LocationMap';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { Heart, MessageCircle, Share2, Flag, MapPin, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { lat, lng } = useLocationStore();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id, lat, lng],
    queryFn: () => productService.getProduct(id, { lat, lng }).then((r) => r.data),
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist-check', id],
    queryFn: () => wishlistService.check(id).then((r) => r.data),
    enabled: isAuthenticated,
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      wishlistData?.inWishlist ? wishlistService.remove(id) : wishlistService.add(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist-check', id]);
      toast.success(wishlistData?.inWishlist ? 'Removed from wishlist' : 'Saved to wishlist');
    },
  });

  const reportMutation = useMutation({
    mutationFn: (reason) => productService.reportProduct(id, { reason }),
    onSuccess: () => {
      toast.success('Report submitted');
      setShowReport(false);
    },
  });

  const handleMessage = async () => {
    if (!isAuthenticated) return router.push('/login');
    try {
      const res = await chatService.createConversation({
        sellerId: product.seller._id,
        productId: id,
      });
      router.push(`/chat?conversation=${res.data.conversation._id}`);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-8"><ProductCardSkeleton /></div>;

  const product = data?.product;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const images = product.images?.length ? product.images : [null];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-background border border-border mb-4">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeImage === i ? 'border-primary' : 'border-border'}`}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-background flex items-center justify-center">📦</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm bg-background px-2 py-1 rounded">{product.category}</span>
              <h1 className="text-3xl font-bold mt-2">{product.title}</h1>
              <p className="text-3xl font-bold text-primary mt-2">
                {formatPrice(product.price)}
                {product.isNegotiable && <span className="text-sm text-muted font-normal ml-2">Negotiable</span>}
              </p>
            </div>
            {product.status === 'sold' && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">Sold</span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted">
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{product.views} views</span>
            <span>{product.condition}</span>
            {product.distance != null && (
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{product.distance} km away</span>
            )}
            <span>Posted {formatDate(product.createdAt)}</span>
          </div>

          <p className="mt-6 text-foreground leading-relaxed">{product.description}</p>

          <div className="mt-6 p-4 rounded-xl border border-border bg-card">
            <Link href={`/profile/${product.seller._id}`} className="flex items-center gap-3 hover:text-primary transition">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {product.seller.profileImage ? (
                  <img src={product.seller.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  product.seller.name?.[0]
                )}
              </div>
              <div>
                <p className="font-semibold">{product.seller.name}</p>
                <p className="text-sm text-muted flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {product.seller.rating || 'New'} · {product.seller.productsSold || 0} sold
                </p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {product.status === 'available' && product.seller._id !== user?._id && (
              <Button onClick={handleMessage}><MessageCircle className="w-4 h-4" /> Message Seller</Button>
            )}
            {isAuthenticated && (
              <Button variant="secondary" onClick={() => wishlistMutation.mutate()}>
                <Heart className={`w-4 h-4 ${wishlistData?.inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistData?.inWishlist ? 'Saved' : 'Save'}
              </Button>
            )}
            <Button variant="ghost" onClick={handleShare}><Share2 className="w-4 h-4" /> Share</Button>
            <Button variant="ghost" onClick={() => setShowReport(!showReport)}><Flag className="w-4 h-4" /> Report</Button>
          </div>

          {showReport && (
            <div className="mt-4 p-4 rounded-xl border border-border space-y-3">
              <input
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for report..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-card"
              />
              <Button variant="danger" size="sm" onClick={() => reportMutation.mutate(reportReason)}>Submit Report</Button>
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-semibold mb-3">Location</h3>
            <LocationMap lat={product.location?.lat} lng={product.location?.lng} height="250px" />
          </div>
        </div>
      </div>
    </div>
  );
}
