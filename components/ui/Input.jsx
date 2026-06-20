import { cn } from '@/lib/utils';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}
      <input
        className={cn(
          'w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary/50',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
