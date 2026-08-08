import React, { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, Globe2, Layers3, Save, Search, Server, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';
type TaskPriority = 'High' | 'Medium' | 'Low';
type WorkstreamKey = 'landing' | 'dashboard' | 'backend';

type SeoTask = {
    id: string;
    title: string;
    owner: string;
    status: TaskStatus;
    priority: TaskPriority;
    notes: string;
};

type OpsState = {
    objectives: string;
    entityCanon: string;
    priorityPrompts: string;
    localAuthorityPlan: string;
    performanceNotes: string;
    tasks: Record<WorkstreamKey, SeoTask[]>;
    updatedAt?: string;
    updatedBy?: string;
};

const STORAGE_KEY = 'alphabag_admin_seo_aeo_workspace';

const DEFAULT_STATE: OpsState = {
    objectives: 'Increase AlphaBAG visibility across search and answer engines while improving technical performance, local authority, and machine readability.',
    entityCanon: 'AlphaBAG = crypto intelligence terminal\nAlphaAI = AI-powered market analysis assistant\nAlphaMap = roadmap and release visibility layer\nGenesis access = staged early-access rollout model',
    priorityPrompts: 'What is AlphaBAG?\nHow does AlphaAI work?\nIs AlphaBAG wallet tracking secure?\nWhich blockchain networks are supported?\nHow does Genesis access work?',
    localAuthorityPlan: 'Priority regions: GCC, UK, US\nNeed region landing variants, hreflang, local PR, and community citations.',
    performanceNotes: 'Target mobile LCP < 2.2s, CLS < 0.1, INP < 200ms. Reduce landing-route JS and keep web3 modules off public critical path.',
    tasks: {
        landing: [
            {
                id: 'lp-1',
                title: 'Split landing tabs into crawlable routes',
                owner: 'Frontend',
                status: 'Not Started',
                priority: 'High',
                notes: 'Expose stable public URLs for Home, Features, Tokenomics, AlphaMap, FAQ, and Markets.'
            },
            {
                id: 'lp-2',
                title: 'Expand schema and metadata coverage',
                owner: 'Frontend + Content',
                status: 'Not Started',
                priority: 'High',
                notes: 'Route-specific titles, descriptions, canonicals, BreadcrumbList, FAQ, Product, and Organization schema.'
            },
            {
                id: 'lp-3',
                title: 'Publish trust and methodology pages',
                owner: 'Frontend + Content',
                status: 'Not Started',
                priority: 'High',
                notes: 'Security Model, Methodology, Network Coverage, Changelog, and AI Limitations pages.'
            },
            {
                id: 'lp-4',
                title: 'Reduce landing-route JS cost',
                owner: 'Frontend',
                status: 'Not Started',
                priority: 'High',
                notes: 'Defer heavy wallet and market modules outside public critical path.'
            }
        ],
        dashboard: [
            {
                id: 'ud-1',
                title: 'Improve public route readability',
                owner: 'Frontend',
                status: 'Not Started',
                priority: 'Medium',
                notes: 'Add intros, summaries, and update timestamps to public product surfaces like Markets.'
            },
            {
                id: 'ud-2',
                title: 'Create public educational product pages',
                owner: 'Frontend + Content',
                status: 'Not Started',
                priority: 'Medium',
                notes: 'Explain whale tracking, portfolio intelligence, AlphaAI, and security scanning.'
            },
            {
                id: 'ud-3',
                title: 'Add acquisition telemetry',
                owner: 'Frontend + Backend',
                status: 'Not Started',
                priority: 'Medium',
                notes: 'Track organic entry points, waitlist conversions, and public route engagement.'
            }
        ],
        backend: [
            {
                id: 'be-1',
                title: 'Add sitemap and robots support',
                owner: 'Backend',
                status: 'Not Started',
                priority: 'High',
                notes: 'Generate clean XML sitemap with lastmod and exclude non-public routes.'
            },
            {
                id: 'be-2',
                title: 'Create freshness and content endpoints',
                owner: 'Backend',
                status: 'Not Started',
                priority: 'High',
                notes: 'Expose last updated values, release notes, supported networks, and public content contracts.'
            },
            {
                id: 'be-3',
                title: 'Add regional content support',
                owner: 'Backend',
                status: 'Not Started',
                priority: 'Medium',
                notes: 'Support localized content, region metadata, and locale update history if scale requires.'
            }
        ]
    }
};

const statusClasses: Record<TaskStatus, string> = {
    'Not Started': 'text-alphabag-subtext border-alphabag-gray bg-alphabag-black/40',
    'In Progress': 'text-alphabag-yellow border-alphabag-yellow/30 bg-alphabag-yellow/10',
    Blocked: 'text-red-400 border-red-500/30 bg-red-500/10',
    Done: 'text-green-400 border-green-500/30 bg-green-500/10'
};

const priorityClasses: Record<TaskPriority, string> = {
    High: 'text-red-300 border-red-500/30 bg-red-500/10',
    Medium: 'text-alphabag-yellow border-alphabag-yellow/30 bg-alphabag-yellow/10',
    Low: 'text-alphabag-blue border-blue-500/30 bg-blue-500/10'
};

const labels: Record<WorkstreamKey, string> = {
    landing: 'Landing Page',
    dashboard: 'User Dashboard',
    backend: 'Backend'
};

const icons: Record<WorkstreamKey, React.ReactNode> = {
    landing: <Globe2 size={18} className="text-alphabag-yellow" />,
    dashboard: <Layers3 size={18} className="text-alphabag-yellow" />,
    backend: <Server size={18} className="text-alphabag-yellow" />
};

export const AdminSeoAeo: React.FC = () => {
    const [state, setState] = useState<OpsState>(DEFAULT_STATE);
    const [lastSavedAt, setLastSavedAt] = useState<string>('');
    const [isHydrating, setIsHydrating] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const hydrate = async () => {
            try {
                const response = await api.get('/api/admin/seo-aeo-workspace');
                const remote = response.data;
                if (remote && Object.keys(remote).length > 0) {
                    setState((prev) => ({ ...prev, ...remote }));
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_STATE, ...remote }));
                } else {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (!raw) return;
                    const parsed = JSON.parse(raw) as OpsState;
                    setState(parsed);
                }
            } catch (error) {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw) as OpsState;
                        setState(parsed);
                    } catch (parseError) {
                        console.error('Failed to restore local SEO/AEO workspace state', parseError);
                    }
                }
                console.error('Failed to load SEO/AEO workspace from API', error);
            } finally {
                setIsHydrating(false);
            }
        };

        hydrate();
    }, []);

    const saveWorkspace = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            const response = await api.post('/api/admin/seo-aeo-workspace', state);
            const workspace = response.data?.workspace || state;
            setState((prev) => ({ ...prev, ...workspace }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
            setLastSavedAt(new Date().toLocaleString());
            setSaveMessage('Synced to backend workspace');
        } catch (error) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            setLastSavedAt(new Date().toLocaleString());
            setSaveMessage('Saved locally only. Backend sync failed.');
            console.error('Failed to save SEO/AEO workspace to API', error);
        } finally {
            setIsSaving(false);
        }
    };

    const summary = useMemo(() => {
        const tasks = Object.values(state.tasks).flat();
        return {
            total: tasks.length,
            done: tasks.filter((task) => task.status === 'Done').length,
            inProgress: tasks.filter((task) => task.status === 'In Progress').length,
            blocked: tasks.filter((task) => task.status === 'Blocked').length,
            highPriority: tasks.filter((task) => task.priority === 'High').length
        };
    }, [state]);

    const updateTextarea = (field: keyof Omit<OpsState, 'tasks'>, value: string) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const updateTask = (group: WorkstreamKey, taskId: string, patch: Partial<SeoTask>) => {
        setState((prev) => ({
            ...prev,
            tasks: {
                ...prev.tasks,
                [group]: prev.tasks[group].map((task) => (task.id === taskId ? { ...task, ...patch } : task))
            }
        }));
    };

    if (isHydrating) {
        return (
            <div className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6">
                <h2 className="font-black text-lg uppercase tracking-[0.18em] text-white">SEO + AEO Ops</h2>
                <p className="text-sm text-alphabag-subtext mt-3">Loading centralized workspace...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatCard label="Total Tasks" value={String(summary.total)} icon={<Target size={18} />} />
                <StatCard label="Completed" value={String(summary.done)} icon={<CheckCircle2 size={18} />} />
                <StatCard label="In Progress" value={String(summary.inProgress)} icon={<Search size={18} />} />
                <StatCard label="Blocked" value={String(summary.blocked)} icon={<Bot size={18} />} />
                <StatCard label="High Priority" value={String(summary.highPriority)} icon={<Server size={18} />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <WorkspaceTextCard
                    title="Program Objective"
                    subtitle="Shared north-star for search visibility, answer visibility, and performance."
                    value={state.objectives}
                    onChange={(value) => updateTextarea('objectives', value)}
                />
                <WorkspaceTextCard
                    title="Canonical Entity Language"
                    subtitle="Keep naming consistent across landing, dashboard, backend, schema, and PR."
                    value={state.entityCanon}
                    onChange={(value) => updateTextarea('entityCanon', value)}
                />
                <WorkspaceTextCard
                    title="Priority Answer Prompts"
                    subtitle="High-value prompts to optimize for across search engines and AI answer systems."
                    value={state.priorityPrompts}
                    onChange={(value) => updateTextarea('priorityPrompts', value)}
                />
                <WorkspaceTextCard
                    title="Local Authority Plan"
                    subtitle="Track priority regions, local PR targets, and geo-page rollout notes."
                    value={state.localAuthorityPlan}
                    onChange={(value) => updateTextarea('localAuthorityPlan', value)}
                />
            </div>

            <WorkspaceTextCard
                title="Technical Performance Notes"
                subtitle="Track Core Web Vitals goals, bundle budget notes, and rendering/crawl concerns."
                value={state.performanceNotes}
                onChange={(value) => updateTextarea('performanceNotes', value)}
            />

            <div className="space-y-6">
                {(Object.keys(state.tasks) as WorkstreamKey[]).map((group) => (
                    <div key={group} className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-alphabag-black/50 border border-alphabag-gray flex items-center justify-center">
                                {icons[group]}
                            </div>
                            <div>
                                <h2 className="font-black text-lg uppercase tracking-[0.18em] text-white">{labels[group]}</h2>
                                <p className="text-xs text-alphabag-subtext font-bold tracking-wide">SEO / AEO execution tasks grouped by implementation surface</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {state.tasks[group].map((task) => (
                                <div key={task.id} className="border border-alphabag-gray/60 rounded-2xl bg-alphabag-black/30 p-4">
                                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4 mb-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-alphabag-subtext">{task.id}</span>
                                                <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-[0.18em] ${statusClasses[task.status]}`}>{task.status}</span>
                                                <span className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-[0.18em] ${priorityClasses[task.priority]}`}>{task.priority}</span>
                                            </div>
                                            <h3 className="text-sm md:text-base font-black text-white tracking-wide">{task.title}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xl:min-w-[340px]">
                                            <select
                                                value={task.status}
                                                onChange={(event) => updateTask(group, task.id, { status: event.target.value as TaskStatus })}
                                                className="bg-alphabag-black/50 border border-alphabag-gray rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-alphabag-yellow"
                                            >
                                                <option>Not Started</option>
                                                <option>In Progress</option>
                                                <option>Blocked</option>
                                                <option>Done</option>
                                            </select>
                                            <select
                                                value={task.priority}
                                                onChange={(event) => updateTask(group, task.id, { priority: event.target.value as TaskPriority })}
                                                className="bg-alphabag-black/50 border border-alphabag-gray rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-alphabag-yellow"
                                            >
                                                <option>High</option>
                                                <option>Medium</option>
                                                <option>Low</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={task.owner}
                                                onChange={(event) => updateTask(group, task.id, { owner: event.target.value })}
                                                className="sm:col-span-2 bg-alphabag-black/50 border border-alphabag-gray rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-alphabag-yellow"
                                                placeholder="Owner"
                                            />
                                        </div>
                                    </div>

                                    <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-alphabag-subtext mb-2">Execution Notes</label>
                                    <textarea
                                        value={task.notes}
                                        onChange={(event) => updateTask(group, task.id, { notes: event.target.value })}
                                        className="w-full h-24 bg-alphabag-black/50 border border-alphabag-gray rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-alphabag-yellow resize-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-alphabag-dark border border-alphabag-gray rounded-2xl p-5">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">Workspace Persistence</h3>
                    <p className="text-xs text-alphabag-subtext font-bold mt-1">Workspace now syncs to the backend admin API, with browser localStorage used as fallback resilience.</p>
                    {lastSavedAt && <p className="text-[10px] text-alphabag-yellow font-black uppercase tracking-[0.18em] mt-2">Saved {lastSavedAt}</p>}
                    {state.updatedAt && <p className="text-[10px] text-alphabag-subtext font-black uppercase tracking-[0.18em] mt-1">Remote update {new Date(state.updatedAt).toLocaleString()} by {state.updatedBy || 'admin'}</p>}
                    {saveMessage && <p className="text-[10px] text-alphabag-blue font-black uppercase tracking-[0.18em] mt-1">{saveMessage}</p>}
                </div>
                <Button onClick={saveWorkspace} disabled={isSaving} className="bg-alphabag-yellow text-black hover:bg-yellow-400">
                    <Save size={16} className="mr-2" />
                    {isSaving ? 'Saving...' : 'Save Workspace'}
                </Button>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-alphabag-dark border border-alphabag-gray/50 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">{icon}</div>
        <p className="text-[10px] font-black text-alphabag-subtext uppercase tracking-[0.2em] mb-2">{label}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
);

const WorkspaceTextCard = ({ title, subtitle, value, onChange }: { title: string; subtitle: string; value: string; onChange: (value: string) => void }) => (
    <div className="bg-alphabag-dark border border-alphabag-gray rounded-2xl p-6">
        <h2 className="font-black text-lg uppercase tracking-[0.18em] text-white">{title}</h2>
        <p className="text-xs text-alphabag-subtext font-bold tracking-wide mt-1 mb-4">{subtitle}</p>
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full h-32 bg-alphabag-black/50 border border-alphabag-gray rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-alphabag-yellow resize-none"
        />
    </div>
);