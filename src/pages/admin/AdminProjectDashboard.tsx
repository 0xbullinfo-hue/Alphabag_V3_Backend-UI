import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, Zap, ExternalLink, Filter, Search, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AlphaRadarService } from '../../services/alphaRadarService';
import Swal from 'sweetalert2';

export const AdminProjectDashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await AlphaRadarService.getScreenerData();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load submissions", error);
            Swal.fire({
                title: 'Sync Failed',
                text: 'Failed to retrieve project submissions from backend API.',
                icon: 'error',
                background: '#0a0a0a',
                color: '#fff',
                confirmButtonColor: '#fcd535'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const handleUpdateStatus = async (projectId: string, status: 'APPROVED' | 'REJECTED', verify: boolean = false) => {
        const actionText = verify ? 'Verify & Approve' : status === 'APPROVED' ? 'Approve' : 'Reject';
        const confirmResult = await Swal.fire({
            title: `${actionText} Project?`,
            text: `Are you sure you want to change this project's status to ${status}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'APPROVED' ? '#22c55e' : '#ef4444',
            confirmButtonText: `Yes, ${actionText}`,
            background: '#0a0a0a',
            color: '#fff'
        });

        if (confirmResult.isConfirmed) {
            setIsLoading(true);
            try {
                const res = await AlphaRadarService.updateProjectStatus(projectId, status, verify);
                if (res.success || res.id) {
                    Swal.fire({
                        title: 'Success',
                        text: `Project status successfully updated to ${status}.`,
                        icon: 'success',
                        background: '#0a0a0a',
                        color: '#fff',
                        confirmButtonColor: '#22c55e'
                    });
                    loadSubmissions();
                } else {
                    Swal.fire({
                        title: 'Failed',
                        text: res.error || 'Failed to update project status.',
                        icon: 'error',
                        background: '#0a0a0a',
                        color: '#fff'
                    });
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'An error occurred while updating status', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handlePromoteToAd = async (projectId: string) => {
        const confirmResult = await Swal.fire({
            title: 'Promote Project to Ad?',
            text: 'This will assign this project to active ad placement slots.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#fcd535',
            confirmButtonText: 'Yes, Promote',
            background: '#0a0a0a',
            color: '#fff'
        });

        if (confirmResult.isConfirmed) {
            setIsLoading(true);
            try {
                const res = await AlphaRadarService.promoteProjectToAd(projectId, 'BOTH');
                if (res.success) {
                    Swal.fire({
                        title: 'Promoted!',
                        text: 'Project successfully promoted to timeline and sidebar ad slots.',
                        icon: 'success',
                        background: '#0a0a0a',
                        color: '#fff',
                        confirmButtonColor: '#fcd535'
                    });
                } else {
                    Swal.fire('Failed', 'Failed to promote project', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'An error occurred while promoting', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesFilter = filter === 'ALL' ? true : sub.status === filter;
        const subTitle = (sub.title || sub.name || '').toLowerCase();
        const subSymbol = (sub.symbol || sub.ticker || '').toLowerCase();
        const matchesSearch = subTitle.includes(searchQuery.toLowerCase()) || subSymbol.includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="flex h-screen bg-alphabag-black">
            <AdminSidebar />
            
            <div className="flex-1 md:pl-64 overflow-y-auto custom-scrollbar">
                <main className="p-4 md:p-8 lg:p-10 pb-20 max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-white/10 gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-alphabag-yellow to-yellow-600 flex items-center justify-center text-black shadow-glow-yellow/20">
                                    <Shield size={16} fill="currentColor" />
                                </div>
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase relative flex items-center">
                                    Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-alphabag-yellow to-yellow-600 drop-shadow-[0_0_15px_rgba(252,213,53,0.3)] ml-2">Control</span>
                                </h1>
                                <span className="badge-yellow text-[8px] h-4">Secure</span>
                            </div>
                            <p className="text-alphabag-subtext text-[10px] font-medium opacity-80 uppercase tracking-widest">Protocol validation and platform asset oversight.</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={loadSubmissions}
                            disabled={isLoading}
                            className="border-white/10 text-[9px] uppercase font-bold tracking-widest gap-2"
                        >
                            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh Data
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List Container */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="glass-panel p-4">
                                <h2 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Shield size={14} className="text-alphabag-yellow" /> Project Submissions
                                </h2>

                                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                    <div className="relative flex-1">
                                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alphabag-muted" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by project name or ticker..." 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:border-alphabag-yellow outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setFilter(tab)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-white/10 text-white' : 'text-alphabag-muted hover:text-white'}`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-alphabag-muted text-[11px] uppercase tracking-widest animate-pulse">
                                            Syncing with Database...
                                        </div>
                                    ) : filteredSubmissions.length === 0 ? (
                                        <div className="text-center py-8 text-alphabag-muted text-[11px] uppercase tracking-widest">
                                            No project submissions found
                                        </div>
                                    ) : (
                                        filteredSubmissions.map(sub => {
                                            const title = sub.title || sub.name || 'Untitled';
                                            const symbol = sub.symbol || sub.ticker || 'N/A';
                                            const founder = sub.ownerTelegram || sub.founder || 'Unknown';
                                            return (
                                                <div key={sub.id} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/[0.08] transition-all group">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-alphabag-dark rounded-lg flex items-center justify-center font-black text-alphabag-yellow uppercase text-xs">
                                                                {symbol[0]}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white uppercase tracking-tight text-[13px]">{title} (${symbol})</div>
                                                                <div className="text-[9px] text-alphabag-muted font-black uppercase tracking-widest mt-0.5">Founder: {founder}</div>
                                                            </div>
                                                        </div>
                                                        {sub.status === 'PENDING' && (
                                                            <div className="flex items-center space-x-2">
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(sub.id, 'APPROVED')}
                                                                    className="p-2 bg-alphabag-green/20 text-alphabag-green rounded-lg hover:bg-alphabag-green hover:text-black transition-all shadow-glow-green"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(sub.id, 'REJECTED')}
                                                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {sub.status !== 'PENDING' && (
                                                            <span className={`px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase ${sub.status === 'APPROVED' ? 'bg-alphabag-green/20 text-alphabag-green' : 'bg-red-500/20 text-red-400'}`}>
                                                                {sub.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {sub.description && (
                                                        <p className="text-alphabag-subtext text-[11px] mt-2 mb-1 pl-1 opacity-80 leading-relaxed">
                                                            {sub.description}
                                                        </p>
                                                    )}

                                                    <div className="border-t border-white/5 mt-4 pt-4 flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <Button 
                                                                onClick={() => handlePromoteToAd(sub.id)}
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="border-white/10 text-[9px] h-7 uppercase font-bold tracking-widest gap-2"
                                                            >
                                                                <Zap size={12} className="text-alphabag-yellow" /> Promote to Ad
                                                            </Button>
                                                            <Button 
                                                                onClick={() => handleUpdateStatus(sub.id, 'APPROVED', true)}
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="border-white/10 text-[9px] h-7 uppercase font-bold tracking-widest gap-2"
                                                            >
                                                                <Shield size={12} className="text-alphabag-green" /> Verify Project
                                                            </Button>
                                                        </div>
                                                        {sub.website && (
                                                            <a 
                                                                href={sub.website} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-alphabag-muted hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                                            >
                                                                Website <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Ad Stats Sidebar */}
                        <div className="space-y-4">
                            <div className="glass-panel p-4">
                                <h2 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Live Ad Slots</h2>
                                <div className="space-y-3">
                                    <div className="p-3 bg-alphabag-yellow/5 border border-alphabag-yellow/20 rounded-xl">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] text-alphabag-yellow font-black uppercase tracking-widest">TIMELINE_POS_01</span>
                                            <span className="text-[9px] text-green-500 font-bold tracking-widest">ACTIVE</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-white">AlphaBAG Pro Campaign</div>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl border-dashed">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] text-alphabag-muted font-black uppercase tracking-widest">SIDEBAR_SLOT_01</span>
                                            <span className="text-[9px] text-alphabag-muted font-bold tracking-widest">VACANT</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-alphabag-muted italic">Click to Assign</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
