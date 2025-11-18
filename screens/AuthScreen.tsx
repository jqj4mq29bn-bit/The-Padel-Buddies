import React, { useState } from 'react';

interface AuthScreenProps {
  onLogin: (name: string, pass: string) => { success: boolean, message: string };
  onSignUp: (name: string, pass: string) => { success: boolean, message: string };
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignUp }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters long.");
        return;
      }
      const result = onSignUp(name.trim(), password);
      if (!result.success) {
        setError(result.message);
      }
    } else { // mode === 'login'
      const result = onLogin(name.trim(), password);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white tracking-tight">Padel Buddies</h1>
            <p className="text-slate-400 mt-2">Your court is waiting.</p>
        </div>

        <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-padel-blue mb-6 text-center">
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Username</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Username"
                className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-3 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue transition-colors"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-3 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue transition-colors"
                required
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-3 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue transition-colors"
                  required
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 mt-2">
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => handleModeChange(mode === 'login' ? 'signup' : 'login')} className="text-sm text-slate-400 hover:text-padel-blue hover:underline">
              {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;