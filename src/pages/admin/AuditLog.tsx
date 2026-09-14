import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export default function AuditLog() {
  const { data, isLoading, error } = useQuery<{ entries: AuditEntry[]; total: number }>({
    queryKey: ['admin', 'audit-log'],
    queryFn: () => axios.get('/api/admin/audit-log?limit=100').then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="p-6 text-neutral-400">Loading audit log…</div>;
  if (error) return <div className="p-6 text-red-400">Failed to load audit log.</div>;

  return (
    <div className="p-6">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-white">Audit Log</h1>
        <span className="text-sm text-neutral-500">{data?.total ?? 0} entries</span>
      </header>

      <div className="overflow-hidden rounded-xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-950 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {data?.entries?.map((e) => (
              <tr key={e.id} className="hover:bg-neutral-900/50">
                <td className="px-4 py-3 text-neutral-400">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-neutral-200">{e.actor}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs text-emerald-400">
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-400">{e.target}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{e.ip}</td>
              </tr>
            ))}
            {!data?.entries?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
