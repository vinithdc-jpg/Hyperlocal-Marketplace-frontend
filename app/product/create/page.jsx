'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { productService, aiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { getUserLocation } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LocationMap from '@/components/map/LocationMap';
import { Sparkles, Upload, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().min(10, 'Description required'),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  condition: z.string().min(1),
  isNegotiable: z.boolean().optional(),
});

const CATEGORIES = ['Electronics', 'Furniture', 'Vehicles', 'Fashion', 'Books', 'Sports', 'Home Appliances', 'Others'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];

export default function CreateProductPage() {
  return (
    <ProtectedRoute>
      <CreateProductForm />
    </ProtectedRoute>
  );
}

function CreateProductForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(user?.location || null);
  const [aiName, setAiName] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isNegotiable: false, category: 'Others', condition: 'Good' },
  });

  const handleImages = (e) => setImages(Array.from(e.target.files));

  const handleGetLocation = async () => {
    try {
      const loc = await getUserLocation();
      setLocation(loc);
      toast.success('Location set');
    } catch {
      toast.error('Could not get location');
    }
  };

  const handleAiDescription = async () => {
    const condition = watch('condition');
    if (!aiName) return toast.error('Enter product name for AI');
    try {
      const res = await aiService.generateDescription({ productName: aiName, condition });
      setValue('title', res.data.title);
      setValue('description', res.data.description);
      toast.success('AI description generated!');
    } catch {
      toast.error('AI generation failed');
    }
  };

  const handleAiPrice = async () => {
    const condition = watch('condition');
    if (!aiName) return toast.error('Enter product name for AI');
    try {
      const res = await aiService.suggestPrice({ productName: aiName, condition });
      setValue('price', res.data.suggestedPrice);
      toast.success(`Suggested: ₹${res.data.suggestedPrice} (₹${res.data.minPrice} - ₹${res.data.maxPrice})`);
    } catch {
      toast.error('AI price suggestion failed');
    }
  };

  const onSubmit = async (data) => {
    if (!location?.lat) return toast.error('Please set product location');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      formData.append('location', JSON.stringify(location));
      images.forEach((img) => formData.append('images', img));

      await productService.createProduct(formData);
      toast.success('Product listed!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create Listing</h1>

      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <Input placeholder="Product name (e.g. iPhone 13)" value={aiName} onChange={(e) => setAiName(e.target.value)} />
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="secondary" size="sm" onClick={handleAiDescription}>
            <Wand2 className="w-4 h-4" /> Generate Description
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleAiPrice}>
            <Sparkles className="w-4 h-4" /> Suggest Price
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
        </div>
        <Input label="Price (₹)" type="number" error={errors.price?.message} {...register('price')} />
        <Select label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} {...register('category')} />
        <Select label="Condition" options={CONDITIONS.map((c) => ({ value: c, label: c }))} {...register('condition')} />
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('isNegotiable')} className="rounded" />
          <span className="text-sm">Price is negotiable</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2">Images (up to 5)</label>
          <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition">
            <Upload className="w-5 h-5" />
            <span>{images.length ? `${images.length} file(s) selected` : 'Upload images'}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Location</label>
            <Button type="button" variant="ghost" size="sm" onClick={handleGetLocation}>Use GPS</Button>
          </div>
          <LocationMap lat={location?.lat} lng={location?.lng} height="200px" />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'List Product'}
        </Button>
      </form>
    </div>
  );
}
