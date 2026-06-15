import React from 'react';
export const BenchmarkingPage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Security Benchmarking</h2>
    <p className="text-muted-foreground mt-1">Compare your security posture against industry, region, and company size.</p>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Your Score: 86 | Industry Avg: 71 | Top Quartile: 93</div>
  </div>
);
