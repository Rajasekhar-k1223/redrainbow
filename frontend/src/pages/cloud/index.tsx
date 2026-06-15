import React from 'react';

export const CloudSecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Cloud Security Posture Management</h2>
      <p className="text-muted-foreground mt-1">AWS, Azure, and GCP misconfiguration detection and IAM analysis.</p>
      <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
        Connecting to AWS CloudTrail and Azure Resource Manager...
      </div>
    </div>
  );
};
