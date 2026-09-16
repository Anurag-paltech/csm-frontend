import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { UsersPanel } from '@/features/admin/components/UsersPanel';
import { DataManagementPanel } from '@/features/admin/components/DataManagementPanel';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'data', label: 'Data Management' },
  { id: 'jobs', label: 'Job Management' },
  { id: 'notifications', label: 'Notification Management' },
];

function ComingSoon({ label }) {
  return (
    <div className="flex h-full items-center justify-center p-5.5">
      <div className="rounded-lg border border-dashed border-line-2 bg-surface-2 px-8 py-10 text-center">
        <p className="font-display text-[13.5px] font-bold text-navy">{label}</p>
        <p className="mt-1 text-[13px] text-ink-3">This section isn’t built yet.</p>
      </div>
    </div>
  );
}

/**
 * Admin console. Route is guarded by <RoleRoute roles={[ROLES.ADMIN]}>; the API
 * also 403s for non-admins. Only the Users tab is implemented; the rest are
 * placeholders.
 */
export function AdminPage() {
  const [tab, setTab] = useState('users');
  const activeLabel = (TABS.find((t) => t.id === tab) ?? TABS[0]).label;

  return (
    <div className="flex h-full flex-col">
      <PageHeader eyebrow="Administration" title="Admin console" />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-line px-5.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={t.id === tab ? 'page' : undefined}
              className={`-mb-px whitespace-nowrap border-b-[2.5px] px-4.75 py-3.25 font-display text-[13.5px] font-bold transition-colors ${
                t.id === tab
                  ? 'border-red text-navy'
                  : 'border-transparent text-ink-3 hover:bg-surface-2 hover:text-navy'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {tab === 'users' ? (
            <UsersPanel />
          ) : tab === 'data' ? (
            <DataManagementPanel />
          ) : (
            <ComingSoon label={activeLabel} />
          )}
        </div>
      </Card>
    </div>
  );
}
