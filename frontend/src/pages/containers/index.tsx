import React from 'react';

export const ContainerSecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Container & Kubernetes Security</h2>
      <p className="text-muted-foreground mt-1">Docker image scanning, CIS benchmark validation, and Runtime threat detection.</p>
      <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
        Integrating with Trivy and Kubescape...
      </div>
    </div>
  );
};
