import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { UsersPanel } from "@/features/admin/components/users/UsersPanel";
import { DataManagementPanel } from "@/features/admin/components/data-management/DataManagementPanel";
import { JobManagementPanel } from "@/features/admin/components/jobs/JobManagementPanel";
import { NotificationListsPanel } from "@/features/admin/components/notifications/NotificationListsPanel";

const TABS = [
  { id: "users", label: "Users" },
  { id: "data", label: "Data Management" },
  { id: "jobs", label: "Job Management" },
  { id: "notifications", label: "Notification Management" },
];

/**
 * Admin console. Route is guarded by <RoleRoute roles={[ROLES.ADMIN]}>; the API
 * also 403s for non-admins.
 */
export function AdminPage() {
  const [tab, setTab] = useState("users");

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
              aria-current={t.id === tab ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-[2.5px] px-4.75 py-3.25 font-display text-[13.5px] font-bold transition-colors ${
                t.id === tab
                  ? "border-red text-navy"
                  : "border-transparent text-ink-3 hover:bg-surface-2 hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {tab === "users" ? (
            <UsersPanel />
          ) : tab === "data" ? (
            <DataManagementPanel />
          ) : tab === "jobs" ? (
            <JobManagementPanel />
          ) : (
            <NotificationListsPanel />
          )}
        </div>
      </Card>
    </div>
  );
}
