import { cn } from '@/lib/utils';

export default function Select({ label, options, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <select
        className={cn(
          'w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}
