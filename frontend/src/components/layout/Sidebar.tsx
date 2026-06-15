import React from 'react';
import { Link } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: '◱' },
  { name: 'Assets', path: '/assets', icon: '🖧' },
  { name: 'Domains', path: '/domains', icon: '🌐' },
  { name: 'Vulnerabilities', path: '/vulnerabilities', icon: '🎯' },
  { name: 'Findings', path: '/findings', icon: '🔍' },
  { name: 'Endpoints', path: '/endpoints', icon: '💻' },
  { name: 'Containers', path: '/containers', icon: '🐳' },
  { name: 'Cloud', path: '/cloud', icon: '☁' },
  { name: 'SIEM', path: '/siem', icon: '📡' },
  { name: 'Evidence Vault', path: '/evidence', icon: '🗄' },
  { name: 'Incidents', path: '/incidents', icon: '⚠' },
  { name: 'Compliance', path: '/compliance', icon: '🛡' },
  { name: 'SOAR', path: '/soar', icon: '⚡' },
  { name: 'Threat Intel', path: '/intel', icon: '🌍' },
  { name: 'Security Data Fabric', path: '/graph', icon: '🕸' },
  { name: 'Exposure (CTEM)', path: '/ctem', icon: '👁' },
  { name: 'Attack Path', path: '/attack-path', icon: '🗺' },
  { name: 'Posture Scoring', path: '/posture', icon: '📊' },
  { name: 'SOC Workspace', path: '/soc', icon: '⚔' },
  { name: 'Purple Team', path: '/purple-team', icon: '🟣' },
  { name: 'Threat Hunting', path: '/threat-hunting', icon: '🏹' },
  { name: 'Supply Chain (SBOM)', path: '/supply-chain', icon: '📦' },
  { name: 'Malware Sandbox', path: '/malware', icon: '🦠' },
  { name: 'Forensics', path: '/forensics', icon: '🔎' },
  { name: 'Security Assistant', path: '/assistant', icon: '🤖' },
  { name: 'Resilience', path: '/resilience', icon: '🔄' },
  // ─ Commercial Evolution (L31-40) ─────────────────────────────────────
  { name: 'Cyber Digital Twin', path: '/digital-twin', icon: '🧠' },
  { name: 'Exec Risk Center', path: '/exec-risk', icon: '💼' },
  { name: 'Third-Party Risk', path: '/tprm', icon: '🤝' },
  { name: 'Insurance Readiness', path: '/insurance', icon: '🟢' },
  { name: 'Benchmarking', path: '/benchmarking', icon: '🏆' },
  { name: 'DSPM', path: '/dspm', icon: '🗂' },
  { name: 'Identity Risk', path: '/identity-risk', icon: '🔑' },
  { name: 'Control Effectiveness', path: '/control-effectiveness', icon: '💯' },
  { name: 'Auto-Investigate', path: '/auto-investigate', icon: '🤖' },
  { name: 'Federation', path: '/federation', icon: '🔗' },
  // ─ Commercial Platform ─────────────────────────────────────────────
  { name: 'Licensing', path: '/licensing', icon: '💳' },
  { name: 'Customer Success', path: '/customer-success', icon: '⭐' },
  { name: 'MSSP Operations', path: '/mssp', icon: '🏢' },
  { name: 'Marketplace', path: '/marketplace', icon: '🛒' },
  { name: 'Developer Portal', path: '/developer', icon: '🚀' },
  // ─ Platform ────────────────────────────────────────────────────────────
  { name: 'Reports', path: '/reports', icon: '📄' },
  { name: 'Settings', path: '/settings', icon: '⚙' },
  { name: 'Audit Logs', path: '/audit', icon: '📋' },
  // ─ Layers 41-50: Evolution I ───────────────────────────────────────────
  { name: 'Cyber Econ Risk', path: '/cyber-econ', icon: '💰' },
  { name: 'Data Lakehouse', path: '/lakehouse', icon: '🧙' },
  { name: 'Threat Observatory', path: '/observatory', icon: '🔭' },
  { name: 'Research Platform', path: '/research-platform', icon: '🧪' },
  { name: 'Industry Editions', path: '/industry-edition', icon: '🏭' },
  { name: 'Cyber Range', path: '/cyber-range', icon: '🎯' },
  { name: 'Partner Ecosystem', path: '/partner-ecosystem', icon: '🤝' },
  { name: 'Product Analytics', path: '/product-analytics', icon: '📊' },
  { name: 'Knowledge Platform', path: '/knowledge-platform', icon: '📚' },
  { name: 'Global Command', path: '/global-command', icon: '🌎' },
  // ─ Layers 51-60: Evolution II ──────────────────────────────────────────
  { name: 'Intel Capture', path: '/intel-capture', icon: '🎤' },
  { name: 'Voice Intelligence', path: '/voice-intel', icon: '🔊' },
  { name: 'Document Intelligence', path: '/doc-intel', icon: '📝' },
  { name: 'Conversation Intel', path: '/conversation-intel', icon: '💬' },
  { name: 'Multimedia Evidence', path: '/multimedia-evidence', icon: '🎥' },
  { name: 'Knowledge Graph AI', path: '/kg-ai', icon: '🧠' },
  { name: 'Autonomous Assistant', path: '/auto-assistant', icon: '👀' },
  { name: 'Mission Orchestrator', path: '/mission-orchestrator', icon: '🚀' },
  { name: 'Decision Support', path: '/decision-support', icon: '⚖' },
  { name: 'Global Security Cloud', path: '/global-cloud', icon: '☁️' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[hsl(var(--surface-glass)/0.8)] backdrop-blur-md border-r border-border/50 flex flex-col h-screen fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-glow-red tracking-wider flex items-center gap-2">
          <span className="text-[hsl(var(--primary))]">Red</span>
          <span className="text-white">Rainbow</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Cyber Defense</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-white hover:bg-[hsl(var(--primary)/0.1)] transition-colors group"
          >
            <span className="text-xl group-hover:text-glow-red">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="status-dot"></div>
          <span className="text-sm font-mono status-live">SYSTEM ONLINE</span>
        </div>
      </div>
    </aside>
  );
};
