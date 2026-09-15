import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Power, Activity, Server, RefreshCw } from 'lucide-react';
import { ProviderHealthPanel } from './ProviderHealthPanel';

interface AdminSystemProps {
    onReboot: () => void;
}

export const AdminSystem: React.FC<AdminSystemProps> = ({ onReboot }) => {
    const { token } = useAuth();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearCaches = async () => {
        if (!confirm("This action flushes application in-memory and Redis caches. It does not reboot the server process. Continue?")) return;

        setIsClearing(true);
        try {
            const res = await api.post('/api/admin/cache/flush', {});
            alert(res.data?.message || 'Application caches cleared successfully.');
            onReboot();
        } catch (error) {
            alert("Cache clear operation failed.");
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Provider & API Health Diagnostics */}
            <ProviderHealthPanel />

            {/* Cache Control Hub */}
            <div className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6 border-l-4 border-l-red-500 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center">
                            <Server className="mr-3 text-red-500" />
                            Cache & Memory Maintenance
                        </h3>
                        <p className="text-alphabag-subtext mt-2 text-sm max-w-lg">
                            Flushes application in-memory caches (portfolio, market prices, AI sessions) and resets rate limiters. Note: this is a soft cache purge, not an OS or process reboot.
                        </p>
                    </div>
                    <Button
                        onClick={handleClearCaches}
                        className="bg-alphabag-red hover:bg-red-600 text-white border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] px-8 py-4 h-auto"
                        disabled={isClearing}
                    >
                        <div className="flex flex-col items-center">
                            <RefreshCw size={24} className={`mb-1 ${isClearing ? 'animate-spin' : ''}`} />
                            <span className="font-black text-sm uppercase tracking-widest">
                                {isClearing ? 'CLEARING...' : 'FLUSH CACHES'}
                            </span>
                        </div>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-alphabag-black/20 border border-alphabag-gray rounded-xl p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center">
                        <Activity size={24} className="text-alphabag-subtext mr-3" />
                        <div>
                            <div className="font-bold text-white">Database Integrity Check</div>
                            <div className="text-[10px] text-alphabag-subtext">Automatic daily health query</div>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" disabled>Scheduled</Button>
                </div>

                <div className="bg-alphabag-black/20 border border-alphabag-gray rounded-xl p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                    <div className="flex items-center">
                        <RefreshCw size={24} className="text-alphabag-subtext mr-3" />
                        <div>
                            <div className="font-bold text-white">Edge CDN Cache</div>
                            <div className="text-[10px] text-alphabag-subtext">Automatic max-age 86400</div>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" disabled>Managed</Button>
                </div>
            </div>
        </div>
    );
};
