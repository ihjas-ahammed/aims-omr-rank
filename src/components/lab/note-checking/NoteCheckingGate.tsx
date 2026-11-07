import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import NoteChecking from './NoteChecking';

interface NoteCheckingGateProps {
  onBack?: () => void;
}

const PASSWORD = 'Aims2019';
const UNLOCK_KEY = 'aims_note_checking_unlocked';
const ADMIN_KEY = 'aims_admin_logged_in'; // set by the main admin login

const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const remember = () => {
  try {
    localStorage.setItem(UNLOCK_KEY, 'true');
  } catch {
    /* storage blocked — unlock lasts for this page view only */
  }
};

// Password screen in front of Note Checking. Unlocks with the admin password, an existing admin
// session, or a link carrying ?pass=<password> (the parameter is removed from the address bar).
export default function NoteCheckingGate({ onBack }: NoteCheckingGateProps) {
  const [unlocked, setUnlocked] = useState(() => readFlag(UNLOCK_KEY) || readFlag(ADMIN_KEY));
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const pass = url.searchParams.get('pass');
    if (pass === null) return;
    url.searchParams.delete('pass');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    if (pass === PASSWORD) {
      remember();
      setUnlocked(true);
    } else {
      setError('That link has the wrong password.');
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      remember();
      setUnlocked(true);
    } else {
      setError('Wrong password. Please try again.');
      setPassword('');
    }
  };

  if (unlocked) return <NoteChecking onBack={onBack} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          {onBack && (
            <button type="button" onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Note Checking</h1>
            <p className="text-xs text-gray-500">Admin password required</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
        )}

        <div className="relative mb-4">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
