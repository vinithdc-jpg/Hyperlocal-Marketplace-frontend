'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll().then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = data?.notifications || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {data?.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()}>
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className={`p-4 rounded-xl border border-border cursor-pointer transition hover:bg-background ${!n.isRead ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted mt-1">{n.message}</p>
                  <p className="text-xs text-muted mt-2">{formatDate(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
              </div>
              {n.link && (
                <Link href={n.link} className="text-sm text-primary hover:underline mt-2 inline-block">
                  View →
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}
