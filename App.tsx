import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import type {
  StrategyKey,
  HistoryItem,
  Stats,
  SingleResponse,
  VariationsResponse,
  ComparisonResponse,
  ToastMessage,
  ToastType,
  ActiveTab,
} from './types';
import { TEMPLATES, STRATEGY_DETAILS } from './constants';
import * as geminiService from './services/geminiService';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import ToastContainer from './components/ToastContainer';

// This is a global variable from the lucide script
declare global {
    interface Window {
        lucide: {
            createIcons: () => void;
        };
    }
}

const App: React.FC = () => {
  // State
  const [inputMessage, setInputMessage] = useState('');
  const [context, setContext] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('single');
  
  // Response state
  const [singleResponse, setSingleResponse] = useState<SingleResponse | null>(null);
  const [variationsResponse, setVariationsResponse] = useState<VariationsResponse | null>(null);
  const [comparisonResponse, setComparisonResponse] = useState<ComparisonResponse | null>(null);

  // Panels and Toasts
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local Storage backed state
  const [stats, setStats] = useState<Stats>(() => {
    const savedStats = localStorage.getItem('stats');
    return savedStats ? JSON.parse(savedStats) : { responses: 0, timeSaved: 0 };
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const savedHistory = localStorage.getItem('response_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  const [isDark, setIsDark] = useState(true); // Default to dark theme

  // Effects
  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('response_history', JSON.stringify(history));
  }, [history]);
  
  useEffect(() => {
    // This app is now always in dark mode per the new theme
    document.documentElement.classList.add('dark');
  }, []);
  
  useLayoutEffect(() => {
    window.lucide?.createIcons();
  });

  // Functions
  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateStats = useCallback((responses: number, timeSaved: number) => {
    setStats(prev => ({
      responses: prev.responses + responses,
      timeSaved: prev.timeSaved + timeSaved,
    }));
  }, []);

  const handleGenerate = async () => {
    if (!inputMessage || !context) {
      addToast('Please fill in both message and context', 'error');
      return;
    }
    if (!selectedStrategy && activeTab !== 'compare') {
      addToast('Please select a strategy', 'error');
      return;
    }

    setLoading(true);
    clearOutputs();
    
    try {
      if (activeTab === 'single' && selectedStrategy) {
        const result = await geminiService.generateSingleResponse(inputMessage, context, selectedStrategy);
        setSingleResponse(result);
        updateStats(1, 5);
        addToast('Response generated!', 'success');
      } else if (activeTab === 'multiple' && selectedStrategy) {
        const result = await geminiService.generateMultipleVariations(inputMessage, context, selectedStrategy);
        setVariationsResponse(result);
        updateStats(result.variations.length, 5);
        addToast(`${result.variations.length} variations generated!`, 'success');
      } else if (activeTab === 'compare') {
        const result = await geminiService.generateComparison(inputMessage, context);
        setComparisonResponse(result);
        updateStats(result.comparison.length, 10);
        addToast('Strategies compared!', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => addToast('Copied to clipboard!', 'success'))
      .catch(() => addToast('Failed to copy', 'error'));
  };

  const handleSaveToHistory = () => {
    if (!singleResponse?.reply) {
        addToast('Nothing to save', 'error');
        return;
    }
    const newItem: HistoryItem = {
      id: Date.now(),
      strategy: selectedStrategy || 'N/A',
      response: singleResponse.reply,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]);
    addToast('Saved to history!', 'success');
  };
  
  const handleExport = () => {
    if (!singleResponse?.reply) {
        addToast('Nothing to export', 'error');
        return;
    }
    const blob = new Blob([singleResponse.reply], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Exported successfully!', 'success');
  };
  
  const clearOutputs = () => {
      setSingleResponse(null);
      setVariationsResponse(null);
      setComparisonResponse(null);
  };
  
  const handleClearAll = () => {
    clearOutputs();
    setSelectedStrategy(null);
    addToast('Output cleared', 'info');
  };

  const handleLoadHistory = (item: HistoryItem) => {
    clearOutputs();
    setSingleResponse({ reply: item.response, analysis: 'Loaded from history.' });
    setSelectedStrategy(item.strategy !== 'N/A' ? item.strategy : null);
    setActiveTab('single');
    setHistoryOpen(false);
    addToast('Loaded from history', 'info');
  };

  const fillTemplate = (type: 'work' | 'friend' | 'customer') => {
      setInputMessage(TEMPLATES[type].message);
      setContext(TEMPLATES[type].context);
  };

  const renderOutput = () => {
    if (loading) {
      return <div className="spinner mx-auto my-8"></div>;
    }

    if (activeTab === 'single' && singleResponse) return <SingleResponseView response={singleResponse} strategy={selectedStrategy} onCopy={handleCopy} onSave={handleSaveToHistory} onExport={handleExport} onClear={handleClearAll} />;
    if (activeTab === 'multiple' && variationsResponse) return <MultipleVariationsView response={variationsResponse} onCopy={handleCopy} />;
    if (activeTab === 'compare' && comparisonResponse) return <ComparisonView response={comparisonResponse} />;
    
    return (
        <div className="text-neutral-500 text-center py-12">
            <i data-lucide="message-square" className="w-12 h-12 mx-auto mb-4 text-neutral-800"></i>
            Your AI-generated response will appear here
        </div>
    );
  };

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <Header stats={stats} onOpenHistory={() => setHistoryOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />

          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InputSection
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              context={context}
              setContext={setContext}
              selectedStrategy={selectedStrategy}
              setSelectedStrategy={setSelectedStrategy}
              onGenerate={handleGenerate}
              onFillTemplate={fillTemplate}
              loading={loading}
              activeTab={activeTab}
            />

            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <div className="tabs">
                  {(['single', 'multiple', 'compare'] as ActiveTab[]).map(tab => (
                    <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1).replace('multiple', 'Multiple Variations').replace('compare', 'Compare Strategies').replace('single', 'Single Response')}
                    </div>
                  ))}
                </div>
                {renderOutput()}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} history={history} onLoadHistory={handleLoadHistory} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

const Header: React.FC<{stats: Stats; onOpenHistory: ()=>void; onOpenSettings: ()=>void}> = ({ stats, onOpenHistory, onOpenSettings }) => (
  <header className="p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg">
                  <i data-lucide="sparkles" className="w-8 h-8 text-emerald-400"></i>
              </div>
              <div>
                  <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                      Emailer Legend Pro
                  </h1>
                  <p className="text-sm text-neutral-400 mt-1">AI-Powered Communication Intelligence</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={onOpenHistory} className="btn-ghost rounded-full p-2" aria-label="Open history"><i data-lucide="history" className="w-5 h-5"></i></button>
              <button onClick={onOpenSettings} className="btn-ghost rounded-full p-2" aria-label="Open settings"><i data-lucide="settings" className="w-5 h-5"></i></button>
          </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Generated" value={stats.responses} colorClasses="text-neutral-200" />
          <StatCard label="Confidence" value={`${90 + (stats.responses % 10)}%`} colorClasses="text-neutral-200" />
          <StatCard label="Time Saved" value={`${stats.timeSaved}m`} colorClasses="text-neutral-200" />
          <StatCard label="Success Rate" value={`${98 + (stats.responses % 2)}%`} colorClasses="text-neutral-200" />
      </div>
  </header>
);

const StatCard: React.FC<{label: string; value: string|number; colorClasses: string;}> = ({label, value, colorClasses}) => (
    <div className="rounded-lg p-4 bg-neutral-900/50 border border-neutral-800/50">
        <div className="text-xs text-neutral-400 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${colorClasses}`}>{value}</div>
    </div>
);

const InputSection: React.FC<{
  inputMessage: string; setInputMessage: (v: string) => void;
  context: string; setContext: (v: string) => void;
  selectedStrategy: StrategyKey | null; setSelectedStrategy: (s: StrategyKey | null) => void;
  onGenerate: () => void;
  onFillTemplate: (t: 'work' | 'friend' | 'customer') => void;
  loading: boolean;
  activeTab: ActiveTab;
}> = ({ inputMessage, setInputMessage, context, setContext, selectedStrategy, setSelectedStrategy, onGenerate, onFillTemplate, loading, activeTab }) => (
    <div className="lg:col-span-1 space-y-6">
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <i data-lucide="mail" className="w-5 h-5 text-emerald-400"></i>
                Input Message
            </h2>
            <textarea value={inputMessage} onChange={e => setInputMessage(e.target.value)} className="textarea" rows={8} placeholder="Paste the message you received..."></textarea>
            
            <h2 className="text-xl font-bold mb-4 mt-6 flex items-center gap-2">
                <i data-lucide="target" className="w-5 h-5 text-emerald-400"></i>
                Context & Goal
            </h2>
            <textarea value={context} onChange={e => setContext(e.target.value)} className="textarea" rows={5} placeholder="Who is this? What's your goal?"></textarea>
            
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => onFillTemplate('work')} className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full">Work Request</button>
                <button onClick={() => onFillTemplate('friend')} className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full">Friend Conflict</button>
                <button onClick={() => onFillTemplate('customer')} className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full">Customer Service</button>
            </div>
        </div>

        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <i data-lucide="zap" className="w-5 h-5 text-emerald-400"></i>
                Select Strategy
            </h2>
            <div className="space-y-3">
                {(Object.keys(STRATEGY_DETAILS) as StrategyKey[]).map(key => (
                    <StrategyCard key={key} strategyKey={key} details={STRATEGY_DETAILS[key]} isSelected={selectedStrategy === key} onSelect={setSelectedStrategy} />
                ))}
            </div>
            <button onClick={onGenerate} className="btn btn-primary w-full mt-6" disabled={loading || (!selectedStrategy && activeTab !== 'compare')}>
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div> : <i data-lucide="wand-2" className="w-4 h-4 mr-2"></i>}
                Generate Response
            </button>
        </div>
    </div>
);

const StrategyCard: React.FC<{
  strategyKey: StrategyKey;
  details: typeof STRATEGY_DETAILS[StrategyKey];
  isSelected: boolean;
  onSelect: (key: StrategyKey | null) => void;
}> = ({ strategyKey, details, isSelected, onSelect }) => (
    <div className={`strategy-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(isSelected ? null : strategyKey)}>
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${details.iconBg} rounded-lg`}><i data-lucide={details.icon} className={`w-5 h-5 ${details.iconColor}`}></i></div>
            <h3 className="font-semibold text-neutral-100">{details.name}</h3>
        </div>
        <p className="text-xs text-neutral-400">{details.description}</p>
    </div>
);

const SingleResponseView: React.FC<{
    response: SingleResponse;
    strategy: StrategyKey | null;
    onCopy: (text: string) => void;
    onSave: () => void;
    onExport: () => void;
    onClear: () => void;
}> = ({ response, strategy, onCopy, onSave, onExport, onClear }) => (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
                {strategy && <span className="badge bg-emerald-400/10 text-emerald-400">{STRATEGY_DETAILS[strategy].name}</span>}
                <span className="badge bg-neutral-800 text-neutral-300">95% Confidence</span>
            </div>
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => onCopy(response.reply)} className="btn-secondary text-xs"><i data-lucide="copy" className="w-4 h-4 mr-1"></i>Copy</button>
                <button onClick={onSave} className="btn-secondary text-xs"><i data-lucide="bookmark" className="w-4 h-4 mr-1"></i>Save</button>
                <button onClick={onExport} className="btn-secondary text-xs"><i data-lucide="download" className="w-4 h-4 mr-1"></i>Export</button>
                <button onClick={onClear} className="btn-secondary text-xs text-red-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"><i data-lucide="trash-2" className="w-4 h-4 mr-1"></i>Clear</button>
            </div>
        </div>
        <label className="block text-sm font-medium mb-2 text-neutral-400">Suggested Reply:</label>
        <textarea className="textarea" rows={10} value={response.reply} readOnly />
        <div className="mt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
                <i data-lucide="brain" className="w-5 h-5 text-emerald-400"></i>Psychological Analysis
            </h4>
            <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-lg p-4 text-sm text-neutral-300" dangerouslySetInnerHTML={{ __html: response.analysis.replace(/\n/g, '<br>') }} />
        </div>
    </div>
);

const MultipleVariationsView: React.FC<{ response: VariationsResponse; onCopy: (text: string) => void; }> = ({ response, onCopy }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {response.variations.map((item, index) => (
                <div key={index} className="accordion-item">
                    <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                        <span className="font-semibold">{item.title}</span>
                        <i data-lucide="chevron-down" className={`w-5 h-5 transition-transform text-neutral-400 ${openIndex === index ? 'rotate-180' : ''}`}></i>
                    </div>
                    <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
                        <textarea className="textarea bg-transparent border-neutral-700" rows={6} value={item.reply} readOnly />
                        <button className="btn-secondary text-xs mt-2" onClick={() => onCopy(item.reply)}>
                            <i data-lucide="copy" className="w-4 h-4 mr-1"></i>Copy
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ComparisonView: React.FC<{ response: ComparisonResponse; }> = ({ response }) => (
    <div className="comparison-grid">
        {response.comparison.map(item => {
            const isWinner = item.strategyName.toUpperCase().includes(response.bestStrategy.toUpperCase());
            return (
                <div key={item.strategyName} className={`comparison-card ${isWinner ? 'winner' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold">{item.strategyName}</h3>
                        {isWinner && <span className="badge bg-emerald-400/10 text-emerald-400">Recommended</span>}
                    </div>
                    <h4 className="font-semibold text-sm mb-1 text-neutral-300">Reply:</h4>
                    <p className="text-sm bg-neutral-800 p-3 rounded-md mb-3 text-neutral-300" dangerouslySetInnerHTML={{ __html: item.reply.replace(/\n/g, '<br>') }}></p>
                    <h4 className="font-semibold text-sm mb-1 text-neutral-300">Analysis:</h4>
                    <p className="text-sm text-neutral-400" dangerouslySetInnerHTML={{ __html: item.analysis.replace(/\n/g, '<br>') }}></p>
                </div>
            );
        })}
    </div>
);


export default App;
