'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/api';
import { useLocationStore, useFilterStore } from '@/store/useStore';
import { getUserLocation } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { MapPin, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const RADIUS_OPTIONS = [
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'nearest', label: 'Nearest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function MarketplacePage() {
  const { lat, lng, radius, setLocation, setRadius } = useLocationStore();
  const { search, category, condition, minPrice, maxPrice, sort, setFilter, resetFilters } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  const { data: meta } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories().then((r) => r.data),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['products', { search, category, condition, minPrice, maxPrice, sort, lat, lng, radius }],
    queryFn: () =>
      productService
        .getProducts({
          search: search || undefined,
          category: category || undefined,
          condition: condition || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
          lat: lat || undefined,
          lng: lng || undefined,
          radius,
        })
        .then((r) => r.data),
  });

  const handleGetLocation = async () => {
    try {
      const loc = await getUserLocation();
      setLocation(loc.lat, loc.lng);
      toast.success('Location updated');
      refetch();
    } catch {
      toast.error('Could not get location. Please enable GPS.');
    }
  };

  useEffect(() => {
    if (!lat) handleGetLocation();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', localSearch);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted mt-1">
            {data?.total ?? 0} products {lat ? `within ${radius} km` : 'near you'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleGetLocation}>
            <MapPin className="w-4 h-4" />
            {lat ? 'Update Location' : 'Enable Location'}
          </Button>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {showFilters && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-card mb-6 animate-fade-in">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setFilter('category', e.target.value)}
            options={[{ value: '', label: 'All Categories' }, ...(meta?.categories?.map((c) => ({ value: c, label: c })) || [])]}
          />
          <Select
            label="Condition"
            value={condition}
            onChange={(e) => setFilter('condition', e.target.value)}
            options={[{ value: '', label: 'All Conditions' }, ...(meta?.conditions?.map((c) => ({ value: c, label: c })) || [])]}
          />
          <Select
            label="Distance"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            options={RADIUS_OPTIONS}
          />
          <Select label="Sort" value={sort} onChange={(e) => setFilter('sort', e.target.value)} options={SORT_OPTIONS} />
          <Input label="Min Price" type="number" value={minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} />
          <Input label="Max Price" type="number" value={maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} />
          <div className="flex items-end">
            <Button variant="ghost" onClick={resetFilters} className="w-full">Reset Filters</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : data?.products?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No products found</p>
          <p className="text-sm mt-2">Try adjusting your filters or increasing the search radius</p>
        </div>
      )}
    </div>
  );
}
