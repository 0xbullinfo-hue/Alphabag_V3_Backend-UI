import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Shield, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const AuditLog: React.FC = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery<{ entries: AuditEntry[]; total: number }>({
    queryKey: ['admin', 'audit-log'],
    queryFn: () => api.get('/api/admin/audit-log?limit=100').then((r) => r.data),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6 shadow-2xl space-y-5">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-alphabag-gray/50 pb-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center">
              <Shield className="mr-2 text-alphabag-yellow" size={20} />
              Protocol Audit Trail
            </h3>
            <p className="text-alphabag-subtext text-xs mt-1">
              Immutable ledger of administrative mutations, configuration adjustments, and security events.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-alphabag-subtext font-mono">
              {data?.total ?? 0} entries logged
            </span>
            <Button
              onClick={() => refetch()}
              size="sm"
              variant="secondary"
              className="border-alphabag-gray bg-alphabag-black hover:bg-white/5 h-8 text-xs font-bold"
              disabled={isFetching}
            >
              <RefreshCw size={13} className={`mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </header>

        {isLoading && (
          <div className="py-12 text-center text-neutral-400 text-sm">
            <RefreshCw size={20} className="animate-spin inline mr-2 text-alphabag-yellow" />
            Loading audit records...
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-xs flex items-center justify-between">
            <span>Failed to synchronize audit records from server.</span>
            <Button size="sm" variant="danger" onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !error && (
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-alphabag-black/40">
            <table className="w-full text-sm">
              <thead className="bg-neutral-950 text-left text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3 font-bold">Timestamp</th>
                  <th className="px-4 py-3 font-bold">Operator</th>
                  <th className="px-4 py-3 font-bold">Mutation / Action</th>
                  <th className="px-4 py-3 font-bold">Target</th>
                  <th className="px-4 py-3 font-bold">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {data?.entries?.map((e) => (
                  <tr key={e.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3 text-neutral-400 text-xs font-mono">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-neutral-200 font-semibold text-xs">{e.actor}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-neutral-800/80 border border-neutral-700 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300 text-xs font-mono">{e.target}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{e.ip}</td>
                  </tr>
                ))}
                {!data?.entries?.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-neutral-500 text-xs">
                      No administrative events recorded in current ledger window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
