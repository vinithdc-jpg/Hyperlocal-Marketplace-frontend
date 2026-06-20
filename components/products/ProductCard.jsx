import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ProductCard({ product }) {
  const image = product.images?.[0] || '/placeholder-product.svg';

  return (
    <Link
      href={`/product/${product._id}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all animate-fade-in"
    >
      <div className="relative h-48 bg-background overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl">📦</div>
        )}
        {product.status === 'sold' && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">Sold</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate group-hover:text-primary transition">{product.title}</h3>
        <p className="text-lg font-bold text-primary mt-1">{formatPrice(product.price)}</p>
        <div className="flex items-center justify-between mt-2 text-sm text-muted">
          <span className="bg-background px-2 py-0.5 rounded text-xs">{product.category}</span>
          {product.distance != null && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {product.distance} km
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted">
          <span>{product.seller?.name}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(product.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
