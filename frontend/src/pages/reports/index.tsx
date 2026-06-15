import React from 'react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Executive Reporting</h2>
          <p className="text-muted-foreground mt-1">Export vulnerability digests, compliance audits, and board-level metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'SOC2 Audit Package', desc: 'Comprehensive control mapping and evidence zip.', icon: '📜' },
          { title: 'Executive Threat Summary', desc: 'High-level metrics on active APT campaigns and risk posture.', icon: '📊' },
          { title: 'Vulnerability Digest', desc: 'CSV export of all Open incidents mapped to CVSS vectors.', icon: '🐛' },
        ].map((report, idx) => (
          <div key={idx} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 flex flex-col justify-between group hover:border-[hsl(var(--glow-cyan)/0.5)] transition-colors">
            <div>
              <span className="text-4xl mb-4 block">{report.icon}</span>
              <h3 className="font-bold text-lg mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground">{report.desc}</p>
            </div>
            <button className="mt-6 w-full py-2 bg-black/40 border border-border/50 rounded text-sm font-bold group-hover:bg-[hsl(var(--glow-cyan)/0.1)] group-hover:text-glow-cyan transition-colors">
              Generate & Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
