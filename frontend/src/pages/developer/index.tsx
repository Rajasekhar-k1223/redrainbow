import React from 'react';

export const DeveloperPage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Developer Portal</h2>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
      API Keys, Webhooks, and SDKs Active.
    </div>
  </div>
);
