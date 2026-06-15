import React, { useEffect, useState } from 'react';
import { fetchIncidents, generateRemediation, setupMfa, verifyMfa } from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  time: string;
  summary?: string;
}

const getSeverityBorder = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'border-l-[hsl(var(--glow-red))]';
    case 'high': return 'border-l-orange-500';
    case 'medium': return 'border-l-yellow-500';
    default: return 'border-l-[hsl(var(--glow-green))]';
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-red-400 bg-red-950/30';
    case 'high': return 'text-orange-400 bg-orange-950/30';
    case 'medium': return 'text-yellow-400 bg-yellow-950/30';
    default: return 'text-green-400 bg-green-950/30';
  }
};

export const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [remediationPlan, setRemediationPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // MFA State
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [mfaData, setMfaData] = useState<{secret: string, uri: string} | null>(null);
  const [mfaInput, setMfaInput] = useState('');
  const [mfaError, setMfaError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data.incidents || []);
      } catch (err) {
        console.error("Failed to load incidents", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAskAI = async (incident: Incident) => {
    setSelectedIncident(incident);
    setRemediationPlan('');
    setAiLoading(true);
    try {
      const data = await generateRemediation(incident.id);
      setRemediationPlan(data.remediation_plan);
    } catch (err) {
      setRemediationPlan('**Error:** Could not contact the AI Core. Please check the backend API and your GEMINI_API_KEY.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\d+)\. /gm, '<br/><span class="text-[hsl(var(--glow-cyan))] font-bold">$1.</span> ')
      .replace(/^#{1,4} (.+)$/gm, '<p class="font-bold text-foreground mt-3">$1</p>')
      .replace(/\n/g, '<br/>');
  };

  const handleSetupMfa = async () => {
    setMfaError('');
    try {
      const data = await setupMfa();
      setMfaData(data);
    } catch (err: any) {
      setMfaError(err.message || 'MFA is already enabled or setup failed.');
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaData || !mfaInput) return;
    try {
      await verifyMfa(mfaData.secret, mfaInput);
      alert('MFA successfully enabled!');
      setShowSecurityModal(false);
      setMfaData(null);
      setMfaInput('');
    } catch (err: any) {
      setMfaError('Invalid code. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mission Control</h2>
          <p className="text-muted-foreground mt-1">Real-time enterprise threat telemetry.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSecurityModal(true)} className="text-sm font-semibold border border-border/50 bg-black/40 px-3 py-1.5 rounded hover:bg-black/60 hover:text-glow-cyan transition-colors flex items-center gap-2">
            <span>🛡</span> Security Profile
          </button>
          <div className="flex items-center gap-2 bg-[hsl(var(--surface-elevated))] px-4 py-2 rounded-md border border-border/50">
            <span className="text-sm text-muted-foreground">Global Risk Score:</span>
            <span className="text-xl font-bold text-glow-cyan">B+</span>
          </div>
        </div>
      </div>

      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[500px] max-w-full">
            <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-2">
              <h3 className="text-xl font-bold">Security Profile</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Protect your account with Layer 2 Identity Access Control (Multi-Factor Authentication).</p>
              
              {!mfaData ? (
                <button onClick={handleSetupMfa} className="w-full bg-[hsl(var(--primary))] text-black py-2 rounded font-bold hover:opacity-90">
                  Enable MFA
                </button>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-2 rounded">
                    <QRCodeSVG value={mfaData.uri} size={150} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Scan this QR code with Google Authenticator or Authy.</p>
                  
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={mfaInput}
                    onChange={(e) => setMfaInput(e.target.value)}
                    maxLength={6}
                    className="w-full bg-black/50 border border-border/50 rounded p-2 text-center text-xl tracking-widest font-mono focus:outline-none focus:border-glow-cyan"
                  />
                  
                  <button onClick={handleVerifyMfa} className="w-full bg-glow-green text-black py-2 rounded font-bold hover:opacity-90">
                    Verify & Save
                  </button>
                </div>
              )}
              
              {mfaError && <p className="text-glow-red text-sm text-center">{mfaError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Incidents', value: incidents.length.toString(), glow: 'glow-red', text: 'text-glow-red' },
          { label: 'Monitored Assets', value: '1,248', glow: 'glow-cyan', text: 'text-glow-cyan' },
          { label: 'Vulnerabilities', value: '42', glow: 'glow-amber', text: 'text-yellow-500' },
          { label: 'Compliance Index', value: '94%', glow: 'glow-green', text: 'text-glow-green' },
        ].map((stat, i) => (
          <div key={i} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 relative overflow-hidden group hover:border-[hsl(var(--border))] transition-colors">
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full ${stat.glow} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <div className={`text-4xl font-bold mt-2 ${stat.text}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Telemetry Stream */}
        <div className="md:col-span-2 bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Live Agent Telemetry</h3>
          <div className="flex-1 overflow-hidden bg-black/40 rounded-md border border-border/50 p-4 font-mono text-sm text-muted-foreground relative">
            <div className="absolute top-0 left-0 w-full h-full bg-scanline pointer-events-none opacity-50"></div>
            <div className="space-y-2 opacity-80">
              <p><span className="text-[hsl(var(--glow-cyan))]">[14:23:01]</span> [Nmap] Port scan initiated on asset: core-db-prod-01</p>
              <p><span className="text-[hsl(var(--glow-cyan))]">[14:23:05]</span> [Trivy] Image analysis complete for registry.acme.corp/api:latest</p>
              <p><span className="text-[hsl(var(--glow-red))]">[14:23:12]</span> [Zeek] Suspicious traffic pattern detected on vlan-200</p>
              <p><span className="text-[hsl(var(--glow-cyan))]">[14:23:15]</span> [SentinelX] Correlating Zeek alert with recent OTX indicators...</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>

        {/* Active Threats with AI Button */}
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">Active Threats</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {loading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Fetching incidents via API...</p>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active threats detected.</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className={`bg-black/20 rounded-md p-3 border border-border/30 border-l-2 ${getSeverityBorder(incident.severity)} hover:bg-black/30 transition-colors`}>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium flex-1 pr-2">{incident.title}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(incident.severity)}`}>{incident.severity}</span>
                    <button
                      onClick={() => handleAskAI(incident)}
                      className="text-xs text-[hsl(var(--glow-cyan))] border border-[hsl(var(--glow-cyan)/0.3)] px-2 py-0.5 rounded hover:bg-[hsl(var(--glow-cyan)/0.1)] transition-colors flex items-center gap-1"
                    >
                      ✨ Ask AI
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Remediation Panel */}
      {(selectedIncident || aiLoading) && (
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-[hsl(var(--glow-cyan)/0.4)] rounded-xl p-6 shadow-[0_0_30px_hsl(var(--glow-cyan)/0.1)]">
          <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--glow-cyan))] shadow-[0_0_8px_hsl(var(--glow-cyan))] animate-pulse"></div>
              <h3 className="text-lg font-semibold text-glow-cyan">AI Remediation Core</h3>
              {selectedIncident && <span className="text-xs text-muted-foreground bg-black/40 px-3 py-1 rounded border border-border/50">— {selectedIncident.title}</span>}
            </div>
            <button onClick={() => { setSelectedIncident(null); setRemediationPlan(''); }} className="text-muted-foreground hover:text-foreground text-xl transition-colors">✕</button>
          </div>

          {aiLoading ? (
            <div className="flex items-center gap-3 py-6">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--glow-cyan))] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--glow-cyan))] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--glow-cyan))] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-muted-foreground text-sm font-mono animate-pulse">Gemini AI analyzing threat vectors and generating response strategy...</span>
            </div>
          ) : (
            <div
              className="text-sm text-muted-foreground leading-relaxed space-y-1 max-h-64 overflow-y-auto pr-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(remediationPlan) }}
            />
          )}
        </div>
      )}
    </div>
  );
};
