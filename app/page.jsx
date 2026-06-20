'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { MapPin, Search, Shield, Zap, Users } from 'lucide-react';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productService.getProducts({ limit: 8, sort: 'newest' }).then((r) => r.data),
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Buy & Sell in Your <span className="text-primary">Neighborhood</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            NeighborMart connects you with local buyers and sellers within 2–20 km. Find great deals right around the corner.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/marketplace"><Button size="lg"><Search className="w-5 h-5" /> Browse Marketplace</Button></Link>
            <Link href="/register"><Button variant="secondary" size="lg">Start Selling</Button></Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Why NeighborMart?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: MapPin, title: 'Hyperlocal Search', desc: 'Find products within 2–20 km using GPS-based distance filtering.' },
            { icon: Zap, title: 'Real-Time Chat', desc: 'Message sellers instantly with read receipts and online status.' },
            { icon: Shield, title: 'Trusted Community', desc: 'Rate sellers, report listings, and build neighborhood trust.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card text-center">
              <Icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest Listings</h2>
          <Link href="/marketplace" className="text-primary hover:underline text-sm">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data?.products?.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
        {!isLoading && !data?.products?.length && (
          <div className="text-center py-12 text-muted">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No listings yet. Be the first to sell!</p>
            <Link href="/product/create" className="text-primary hover:underline mt-2 inline-block">Create a listing</Link>
          </div>
        )}
      </section>
    </div>
  );
}
