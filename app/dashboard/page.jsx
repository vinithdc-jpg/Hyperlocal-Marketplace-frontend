'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { Plus } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Email: {user?.email}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Profile Rating</h3>
          <p className="text-2xl font-bold text-blue-600">{user?.rating || 0} ⭐</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Phone</h3>
          <p className="text-2xl font-bold text-gray-800">{user?.phone || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Location</h3>
          <p className="text-lg text-gray-800">
            {user?.location?.lat ? `${user.location.lat}, ${user.location.lng}` : 'Not set'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/product/create"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create New Product
        </Link>
        <Link
          href="/profile"
          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
