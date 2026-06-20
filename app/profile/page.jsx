'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/api';
import { getUserLocation } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LocationMap from '@/components/map/LocationMap';
import { Star, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, updateUser } = useAuth();
  const [location, setLocation] = useState(user?.location);
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userService.updateProfile(data);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await userService.updateProfileImage(formData);
      updateUser(res.data.user);
      toast.success('Photo updated');
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleLocation = async () => {
    try {
      const loc = await getUserLocation();
      setLocation(loc);
      const res = await userService.updateLocation(loc);
      updateUser(res.data.user);
      toast.success('Location updated');
    } catch {
      toast.error('Could not update location');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await userService.changePassword(passwords);
      toast.success('Password changed');
      setPasswords({ current: '', new: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="flex items-center gap-6 mb-8 p-6 rounded-xl border border-border bg-card">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-muted">{user?.email}</p>
          <p className="flex items-center gap-1 mt-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {user?.rating || 0} rating · Joined {new Date(user?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8 p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold">Edit Profile</h3>
        <Input label="Name" {...register('name')} />
        <Input label="Phone" {...register('phone')} />
        <Button type="submit">Save Changes</Button>
      </form>

      <div className="mb-8 p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Location</h3>
          <Button variant="secondary" size="sm" onClick={handleLocation}>Update GPS</Button>
        </div>
        <LocationMap lat={location?.lat} lng={location?.lng} height="200px" />
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4 p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold">Change Password</h3>
        <Input label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
        <Input label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
        <Button type="submit" variant="secondary">Change Password</Button>
      </form>
    </div>
  );
}
