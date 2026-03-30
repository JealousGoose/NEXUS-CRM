import React, { useState } from 'react';
import { MessageSquare, Save, Copy, Check, Info } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_SCRIPT = `Hi [Name], this is [Your Name]!

I'm calling because I saw you requested info/we met at [Event].

The reason for my call is that I help people like you to [Benefit 1] and [Benefit 2].

I wanted to see if you'd be open to a quick 5-min chat about how we could help you achieve [Goal]?

Do you have a moment, or should I call back at a better time?`;

const CallScript = () => {
  const [script, setScript] = useLocalStorage('crm_script', DEFAULT_SCRIPT);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Call Script</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your go-to pitch for high conversions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="btn-secondary"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            <span className="hidden sm:inline">{isEditing ? 'Save Script' : 'Edit Script'}</span>
          </button>
        </div>
      </div>

      <div className="card-container overflow-hidden shadow-sm border-slate-200 dark:border-slate-800">
        {isEditing ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
             <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Editor Mode</label>
             <textarea 
               className="input-field min-h-[400px] text-lg leading-relaxed font-medium bg-white dark:bg-slate-800"
               value={script}
               onChange={(e) => setScript(e.target.value)}
               autoFocus
             />
          </div>
        ) : (
          <div className="p-8 md:p-12 relative">
             <div className="absolute top-4 right-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-2 rounded-xl flex items-center gap-2 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50">
                <Info className="w-4 h-4" /> Reading Mode
             </div>
             <div className="whitespace-pre-wrap text-2xl md:text-3xl leading-relaxed font-semibold text-slate-800 dark:text-slate-100 max-w-3xl mx-auto py-8">
               {script}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallScript;
