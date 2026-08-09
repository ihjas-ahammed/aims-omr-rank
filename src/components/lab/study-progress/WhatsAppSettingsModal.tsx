import React, { useState } from 'react';
import { 
  WhatsAppAPISettings, 
  getWhatsAppSettings, 
  saveWhatsAppSettings, 
  DEFAULT_WA_CAPTION 
} from '../../../utils/whatsappService';
import { X, MessageSquare, Key, Check, RefreshCw, Send, Sparkles } from 'lucide-react';

interface WhatsAppSettingsModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export default function WhatsAppSettingsModal({ onClose, onSaved }: WhatsAppSettingsModalProps) {
  const [settings, setSettings] = useState<WhatsAppAPISettings>(() => getWhatsAppSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWhatsAppSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (onSaved) onSaved();
  };

  const insertPlaceholder = (ph: string) => {
    setSettings(prev => ({
      ...prev,
      customCaption: prev.customCaption + ph
    }));
  };

  const handleTestAPI = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://graph.facebook.com/v26.0/${settings.phoneNumberId.trim()}`, {
        headers: {
          'Authorization': `Bearer ${settings.accessToken.trim()}`
        }
      });

      const data = await res.json();
      if (res.ok && data?.id) {
        setTestResult(`✓ Connected Successfully! Verified Name: ${data.verified_name || 'Test Number'} (${data.display_phone_number || ''})`);
      } else {
        setTestResult(`❌ Connection Failed: ${data?.error?.message || 'Invalid Access Token or Phone ID'}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Network Error: ${err.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-white space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">WhatsApp Integration Settings</h3>
              <p className="text-xs text-slate-400">Configure Meta Cloud API & customize WhatsApp message captions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSaved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> WhatsApp settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Custom Caption Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Custom WhatsApp Caption / Message
              </label>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, customCaption: DEFAULT_WA_CAPTION }))}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Reset Default
              </button>
            </div>

            {/* Placeholder Tags Quick Bar */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[10px] text-slate-400 font-bold">Placeholders:</span>
              {['{name}', '{admNo}', '{class}', '{percentage}', '{daysLeft}', '{link}'].map(ph => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => insertPlaceholder(` ${ph} `)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-md text-[11px] font-mono font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  + {ph}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={settings.customCaption}
              onChange={(e) => setSettings(prev => ({ ...prev, customCaption: e.target.value }))}
              className="w-full p-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              placeholder="Enter template text..."
            />
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-400" /> Meta WhatsApp Business Cloud API Credentials
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Phone Number ID (e.g. 1245984048606793)
              </label>
              <input
                type="text"
                value={settings.phoneNumberId}
                onChange={(e) => setSettings(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                className="w-full h-11 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                placeholder="Phone Number ID"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Permanent / System User Access Token (Bearer Token)
              </label>
              <input
                type="password"
                value={settings.accessToken}
                onChange={(e) => setSettings(prev => ({ ...prev, accessToken: e.target.value }))}
                className="w-full h-11 px-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                placeholder="Bearer EAG..."
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                testResult.startsWith('✓') 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {testResult}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestAPI}
                disabled={isTesting}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Test API Connection
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Save WhatsApp Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
