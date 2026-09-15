import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Server, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProviderItem {
  provider: string;
  kind?: string;
  chain?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'RATE_LIMITED' | 'AUTH_FAILED' | 'UNAVAILABLE' | 'ERROR' | 'UNCONFIGURED' | 'UNKNOWN' | string;
  latencyMs?: number;
  blockOrSlot?: number | string | null;
  message?: string;
}

interface ProviderHealthResponse {
  status: 'HEALTHY' | 'DEGRADED' | string;
  checkedAt: string;
  fromCache?: boolean;
  providers: ProviderItem[];
}

export const ProviderHealthPanel: React.FC = () => {
  const [health, setHealth] = useState<ProviderHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async (fresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ProviderHealthResponse>(`/api/system/health/providers${fresh ? '?fresh=true' : ''}`);
      setHealth(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to load provider diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={11} className="mr-1" /> HEALTHY
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <AlertTriangle size={11} className="mr-1" /> DEGRADED
          </span>
        );
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Clock size={11} className="mr-1" /> RATE LIMITED
          </span>
        );
      case 'AUTH_FAILED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle size={11} className="mr-1" /> AUTH FAILED
          </span>
        );
      case 'UNCONFIGURED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">
            UNCONFIGURED
          </span>
        );
      case 'UNAVAILABLE':
      case 'ERROR':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle size={11} className="mr-1" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-alphabag-gray/50 pb-4">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center">
            <Server className="mr-2 text-alphabag-yellow" size={20} />
            Provider & API Health Diagnostics
          </h3>
          <p className="text-alphabag-subtext text-xs mt-1">
            Realtime connectivity, latency, and fault classification across RPCs, database, cache, market feeds, and AI.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {health && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-alphabag-subtext">Overall:</span>
              {getStatusBadge(health.status)}
              <span className="text-[10px] text-alphabag-subtext font-mono">
                {new Date(health.checkedAt).toLocaleTimeString()}
              </span>
            </div>
          )}
          <Button
            onClick={() => fetchHealth(true)}
            size="sm"
            variant="secondary"
            className="border-alphabag-gray bg-alphabag-black hover:bg-white/5 h-8 text-xs font-bold"
            disabled={isLoading}
          >
            <RefreshCw size={13} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="danger" onClick={() => fetchHealth(true)}>Retry</Button>
        </div>
      )}

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {health.providers.map((p) => (
            <div
              key={p.provider}
              className="bg-alphabag-black/40 border border-alphabag-gray rounded-xl p-3.5 flex flex-col justify-between space-y-2 hover:border-neutral-700 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white capitalize">{p.provider}</span>
                  {p.kind && (
                    <span className="ml-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-alphabag-subtext font-mono">
                      {p.kind}
                    </span>
                  )}
                </div>
                {getStatusBadge(p.status)}
              </div>

              <div className="flex items-center justify-between text-xs text-alphabag-subtext pt-1 border-t border-alphabag-gray/30">
                <span>Latency:</span>
                <span className="font-mono text-white font-semibold">
                  {p.latencyMs != null ? `${p.latencyMs}ms` : '—'}
                </span>
              </div>

              {p.blockOrSlot != null && (
                <div className="flex items-center justify-between text-[11px] text-alphabag-subtext font-mono">
                  <span>Block / Slot:</span>
                  <span className="text-alphabag-yellow font-bold">#{p.blockOrSlot.toLocaleString()}</span>
                </div>
              )}

              {p.message && (
                <div className="text-[10px] text-rose-400 font-mono truncate" title={p.message}>
                  Error: {p.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderHealthPanel;
