import React, { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Settings</h2>
          <p className="text-muted-foreground mt-1">Configure your enterprise workspace and integrations.</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0 space-y-1">
          {['profile', 'security', 'integrations', 'api_keys'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-[hsl(var(--glow-cyan)/0.1)] text-glow-cyan border-l-2 border-glow-cyan' : 'text-muted-foreground hover:bg-black/40 hover:text-foreground'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">User Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <input type="text" disabled value="admin@acme.corp" className="w-full mt-1 bg-black/50 border border-border/50 rounded px-3 py-2 text-muted-foreground cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Role</label>
                  <input type="text" disabled value="Super Admin" className="w-full mt-1 bg-black/50 border border-border/50 rounded px-3 py-2 text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold border-b border-border/50 pb-2 mb-4">External Integrations</h3>
              
              <div className="border border-border/50 rounded-lg p-4 flex justify-between items-center bg-black/20">
                <div>
                  <h4 className="font-bold">SentinelX (AI SOC)</h4>
                  <p className="text-sm text-muted-foreground">Bi-directional AI threat intelligence sync.</p>
                </div>
                <button className="px-4 py-2 bg-[hsl(var(--primary))] text-black font-bold rounded text-sm hover:opacity-90">Connect</button>
              </div>

              <div className="border border-border/50 rounded-lg p-4 flex justify-between items-center bg-black/20">
                <div>
                  <h4 className="font-bold">UniCloudOps</h4>
                  <p className="text-sm text-muted-foreground">Automated Cloud Infrastructure Discovery.</p>
                </div>
                <button className="px-4 py-2 bg-[hsl(var(--primary))] text-black font-bold rounded text-sm hover:opacity-90">Connect</button>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4 flex justify-between items-center bg-black/20">
                <div>
                  <h4 className="font-bold">Slack / PagerDuty Webhooks</h4>
                  <p className="text-sm text-muted-foreground">Outbound alerting for Critical Incidents.</p>
                </div>
                <button className="px-4 py-2 border border-[hsl(var(--glow-cyan)/0.5)] text-glow-cyan font-bold rounded text-sm hover:bg-[hsl(var(--glow-cyan)/0.1)]">Configured</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
