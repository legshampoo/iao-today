import { AdminShell } from '@/components/AdminShell'

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="Site-level settings will live here.">
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <p className="text-sm leading-6 text-zinc-500">
          No settings are needed for the manual listings MVP yet.
        </p>
      </div>
    </AdminShell>
  )
}
