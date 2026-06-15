import React, { useState } from 'react';
import { login } from '../../services/auth';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin@acme.corp');
  const [password, setPassword] = useState('Admin123!');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password, mfaRequired ? mfaCode : undefined);
      // Redirect to dashboard
      window.location.href = '/';
    } catch (err: any) {
      if (err.message === 'MFA_REQUIRED') {
        setMfaRequired(true);
        setError('');
      } else {
        setError(err.message || 'Invalid username or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--glow-cyan))] opacity-[0.15] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[hsl(var(--glow-red))] opacity-[0.1] blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-foreground drop-shadow-[0_0_15px_hsl(var(--glow-cyan)/0.5)]">
          RedRainbow
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enterprise Cyber Defense Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-xl py-8 px-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-[hsl(var(--glow-cyan)/0.3)] sm:rounded-2xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!mfaRequired ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Email / Username
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-border/50 rounded-md shadow-sm bg-black/50 text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan))] focus:border-[hsl(var(--glow-cyan))] sm:text-sm transition-all"
                      placeholder="admin@acme.corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-border/50 rounded-md shadow-sm bg-black/50 text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan))] focus:border-[hsl(var(--glow-cyan))] sm:text-sm transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Authenticator Code (MFA)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-border/50 rounded-md shadow-sm bg-black/50 text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--glow-cyan))] focus:border-[hsl(var(--glow-cyan))] sm:text-sm transition-all font-mono text-center tracking-widest text-lg"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Open your authenticator app to view the 6-digit code.
                </p>
              </div>
            )}

            {error && (
              <div className="text-glow-red text-sm bg-red-500/10 border border-red-500/20 p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-[0_0_15px_hsl(var(--glow-cyan)/0.3)] text-sm font-medium text-black bg-[hsl(var(--glow-cyan))] hover:bg-[hsl(var(--glow-cyan)/0.9)] hover:shadow-[0_0_25px_hsl(var(--glow-cyan)/0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-[hsl(var(--glow-cyan))] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (mfaRequired ? 'Verify & Login' : 'Secure Login')}
              </button>
              {mfaRequired && (
                <button
                  type="button"
                  onClick={() => setMfaRequired(false)}
                  className="w-full mt-2 flex justify-center py-2 px-4 border border-border/50 rounded-md text-sm font-medium text-muted-foreground hover:text-white transition-all"
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Layer 2 Identity Access Control.</p>
            <p>Unauthorized access is strictly prohibited and audited.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
