import React from 'react';

export const DomainsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Domain Security</h2>
      <p className="text-muted-foreground mt-1">DNS monitoring, SPF/DKIM validation, and Typosquatting detection.</p>
      <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
        Domain Monitoring Engine Active. Connecting to backend resolvers...
      </div>
    </div>
  );
};
