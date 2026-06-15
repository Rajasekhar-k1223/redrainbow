import React, { useEffect, useState } from 'react';
import { fetchAssets, triggerScan, scanDomain, scanWeb, scanServer, scanContainer, scanCloud } from '../../services/api';

interface Asset {
  id: string;
  asset_type: string;
  identifier: string;
  environment: string;
  criticality: string;
  owner: string;
  status: string;
}

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [webScanResult, setWebScanResult] = useState<any>(null);
  const [serverScanResult, setServerScanResult] = useState<any>(null);
  const [containerScanResult, setContainerScanResult] = useState<any>(null);
  const [cloudScanResult, setCloudScanResult] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } catch (err) {
        console.error("Failed to load assets", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const getCriticalityColor = (crit: string) => {
    switch (crit.toLowerCase()) {
      case 'high': return 'text-glow-red border-[hsl(var(--glow-red)/0.4)]';
      case 'medium': return 'text-yellow-500 border-yellow-500/40 text-glow-amber';
      case 'low': return 'text-glow-green border-[hsl(var(--glow-green)/0.4)]';
      default: return 'text-muted-foreground border-border/50';
    }
  };

  const handleScan = async (assetId: string, assetType: string) => {
    try {
      setAssets(assets.map(a => a.id === assetId ? { ...a, status: 'Scanning...' } : a));
      
      if (assetType.toLowerCase() === 'domain') {
        const result = await scanDomain(assetId);
        setScanResult(result);
        
        // Reload assets
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } else if (['web app', 'api'].includes(assetType.toLowerCase())) {
        const result = await scanWeb(assetId);
        setWebScanResult(result);
        
        // Reload assets
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } else if (['server', 'endpoint'].includes(assetType.toLowerCase())) {
        const result = await scanServer(assetId);
        setServerScanResult(result);
        
        // Reload assets
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } else if (assetType.toLowerCase() === 'container') {
        const result = await scanContainer(assetId);
        setContainerScanResult(result);
        
        // Reload assets
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } else if (assetType.toLowerCase() === 'cloud account') {
        const result = await scanCloud(assetId);
        setCloudScanResult(result);
        
        // Reload assets
        const data = await fetchAssets();
        setAssets(data.assets || []);
      } else {
        await triggerScan(assetId);
        setTimeout(async () => {
          const data = await fetchAssets();
          setAssets(data.assets || []);
        }, 4000);
      }
    } catch (err) {
      console.error("Failed to trigger scan", err);
      alert("Scan failed. Ensure backend dependencies (dnspython) are installed and running.");
      setAssets(assets.map(a => a.id === assetId ? { ...a, status: 'Monitored' } : a));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Inventory</h2>
          <p className="text-muted-foreground mt-1">Manage and monitor all enterprise targets.</p>
        </div>
        <button className="bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--glow-cyan)/0.2)] hover:border-glow-cyan transition-colors px-4 py-2 rounded-md border border-border/50 text-sm font-medium">
          + Register Asset
        </button>
      </div>

      {scanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[600px] max-w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Domain Security Report: <span className="text-glow-cyan font-mono">{scanResult.domain}</span></h3>
              <button onClick={() => setScanResult(null)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className={`text-xl font-bold ${scanResult.status === 'Healthy' ? 'text-glow-green' : 'text-glow-red'}`}>{scanResult.status}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-xl font-bold font-mono">{scanResult.risk_score}</p>
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">SSL Certificate</h4>
                {scanResult.ssl.valid ? (
                  <p className="text-sm text-glow-green font-mono">Valid. Expires in {scanResult.ssl.days_remaining} days.</p>
                ) : (
                  <p className="text-sm text-glow-red font-mono">Invalid or Unreachable</p>
                )}
              </div>
              
              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">Email Security</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>SPF Record: {scanResult.email_security.spf_valid ? <span className="text-glow-green">Valid</span> : <span className="text-glow-red">Missing</span>}</div>
                  <div>DMARC Record: {scanResult.email_security.dmarc_valid ? <span className="text-glow-green">Valid</span> : <span className="text-glow-red">Missing</span>}</div>
                </div>
              </div>
              
              {scanResult.issues.length > 0 && (
                <div className="bg-[hsl(var(--glow-red)/0.1)] border border-[hsl(var(--glow-red)/0.3)] p-4 rounded">
                  <h4 className="font-semibold text-glow-red mb-2">Detected Issues</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {scanResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-red-200">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setScanResult(null)} className="bg-[hsl(var(--primary))] text-black px-4 py-2 rounded font-semibold">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {webScanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Web Security Report: <span className="text-glow-cyan font-mono">{webScanResult.target}</span></h3>
              <button onClick={() => setWebScanResult(null)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className={`text-xl font-bold ${webScanResult.status === 'Healthy' ? 'text-glow-green' : webScanResult.status === 'Warning' ? 'text-yellow-500' : 'text-glow-red'}`}>{webScanResult.status}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-xl font-bold font-mono">{webScanResult.risk_score}</p>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">Server Details</h4>
                <div className="text-sm font-mono">{webScanResult.server_info}</div>
              </div>
              
              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">Security Headers</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(webScanResult.headers || {}).map(([header, isPresent]) => (
                    <div key={header}>
                      <span className="font-mono">{header}:</span> {isPresent ? <span className="text-glow-green">Present</span> : <span className="text-glow-red">Missing</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              {webScanResult.issues && webScanResult.issues.length > 0 && (
                <div className="bg-[hsl(var(--glow-red)/0.1)] border border-[hsl(var(--glow-red)/0.3)] p-4 rounded">
                  <h4 className="font-semibold text-glow-red mb-2">Detected Vulnerabilities</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {webScanResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-red-200 font-mono text-xs">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setWebScanResult(null)} className="bg-[hsl(var(--primary))] text-black px-4 py-2 rounded font-semibold hover:opacity-90">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {serverScanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Server Exposure Report: <span className="text-glow-cyan font-mono">{serverScanResult.target}</span></h3>
              <button onClick={() => setServerScanResult(null)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className={`text-xl font-bold ${serverScanResult.status === 'Healthy' ? 'text-glow-green' : serverScanResult.status === 'Warning' ? 'text-yellow-500' : 'text-glow-red'}`}>{serverScanResult.status}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-xl font-bold font-mono">{serverScanResult.risk_score}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Resolved IP</p>
                  <p className="text-xl font-bold font-mono">{serverScanResult.resolved_ip}</p>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">Open Ports Detected</h4>
                {serverScanResult.open_ports.length === 0 ? (
                  <p className="text-sm text-glow-green">No critical open ports detected. Infrastructure is properly firewalled.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {serverScanResult.open_ports.map((p: any) => (
                      <span key={p.port} className="bg-black/60 border border-border/50 px-3 py-1 rounded-full text-sm font-mono text-glow-cyan">
                        Port {p.port} ({p.service})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {serverScanResult.issues && serverScanResult.issues.length > 0 && (
                <div className="bg-[hsl(var(--glow-red)/0.1)] border border-[hsl(var(--glow-red)/0.3)] p-4 rounded">
                  <h4 className="font-semibold text-glow-red mb-2">Configuration Drift & Exposures</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {serverScanResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-red-200 font-mono text-xs">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setServerScanResult(null)} className="bg-[hsl(var(--primary))] text-black px-4 py-2 rounded font-semibold hover:opacity-90">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {containerScanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Container Analysis: <span className="text-glow-cyan font-mono">{containerScanResult.target}</span></h3>
              <button onClick={() => setContainerScanResult(null)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <p className={`text-xl font-bold ${containerScanResult.status === 'Secure' ? 'text-glow-green' : containerScanResult.status === 'Warning' ? 'text-yellow-500' : 'text-glow-red'}`}>{containerScanResult.status}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-xl font-bold font-mono">{containerScanResult.risk_score}</p>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">Image Metadata</h4>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <div><span className="text-muted-foreground">Image ID:</span> {containerScanResult.metadata.id.substring(0, 19)}...</div>
                  <div><span className="text-muted-foreground">User:</span> {containerScanResult.metadata.user || "root (default)"}</div>
                  <div><span className="text-muted-foreground">Env Vars:</span> {containerScanResult.metadata.env_vars}</div>
                  <div><span className="text-muted-foreground">Exposed Ports:</span> {containerScanResult.metadata.exposed_ports.length > 0 ? containerScanResult.metadata.exposed_ports.join(", ") : "None"}</div>
                </div>
              </div>
              
              {containerScanResult.issues && containerScanResult.issues.length > 0 && (
                <div className="bg-[hsl(var(--glow-red)/0.1)] border border-[hsl(var(--glow-red)/0.3)] p-4 rounded">
                  <h4 className="font-semibold text-glow-red mb-2">Detected Security Issues</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {containerScanResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className={`${issue.includes('CRITICAL') ? 'text-red-400 font-bold' : issue.includes('HIGH') ? 'text-red-300' : 'text-yellow-300'} font-mono text-xs`}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setContainerScanResult(null)} className="bg-[hsl(var(--primary))] text-black px-4 py-2 rounded font-semibold hover:opacity-90">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {cloudScanResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 w-[700px] max-w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Cloud Posture Report: <span className="text-glow-cyan font-mono">{cloudScanResult.target}</span></h3>
              <button onClick={() => setCloudScanResult(null)} className="text-muted-foreground hover:text-white">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Overall Posture</p>
                  <p className={`text-xl font-bold ${cloudScanResult.status === 'Secure' ? 'text-glow-green' : cloudScanResult.status === 'Warning' ? 'text-yellow-500' : 'text-glow-red'}`}>{cloudScanResult.status}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className="text-xl font-bold font-mono">{cloudScanResult.risk_score}</p>
                </div>
                <div className="flex-1 bg-black/40 p-4 rounded border border-border/50">
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="text-xl font-bold">{cloudScanResult.metadata.provider}</p>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded border border-border/50">
                <h4 className="font-semibold mb-2 border-b border-border/50 pb-2">CSPM Scan Scope</h4>
                <div className="grid grid-cols-3 gap-2 text-sm font-mono text-center">
                  <div>
                    <div className="text-2xl font-bold text-glow-cyan">{cloudScanResult.metadata.iam_users_scanned}</div>
                    <div className="text-muted-foreground text-xs">IAM Roles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-glow-cyan">{cloudScanResult.metadata.storage_buckets_scanned}</div>
                    <div className="text-muted-foreground text-xs">Storage Buckets</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-glow-cyan">{cloudScanResult.metadata.security_groups_scanned}</div>
                    <div className="text-muted-foreground text-xs">Security Groups</div>
                  </div>
                </div>
              </div>
              
              {cloudScanResult.issues && cloudScanResult.issues.length > 0 && (
                <div className="bg-[hsl(var(--glow-red)/0.1)] border border-[hsl(var(--glow-red)/0.3)] p-4 rounded">
                  <h4 className="font-semibold text-glow-red mb-2">Detected Misconfigurations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {cloudScanResult.issues.map((issue: string, idx: number) => (
                      <li key={idx} className={`${issue.includes('CRITICAL') ? 'text-red-400 font-bold' : issue.includes('HIGH') ? 'text-red-300' : 'text-yellow-300'} font-mono text-xs`}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setCloudScanResult(null)} className="bg-[hsl(var(--primary))] text-black px-4 py-2 rounded font-semibold hover:opacity-90">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex gap-4 bg-black/20">
          <input 
            type="text" 
            placeholder="Filter assets..." 
            className="bg-black/40 border border-border/50 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-glow-cyan w-64 text-foreground"
          />
          <select className="bg-black/40 border border-border/50 rounded-md py-1.5 px-3 text-sm focus:outline-none text-foreground">
            <option value="">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-black/10">
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Identifier</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Environment</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Criticality</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground animate-pulse">Loading assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No assets found.</td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-black/20 transition-colors group">
                    <td className="py-3 px-4 font-mono text-sm group-hover:text-glow-cyan transition-colors">{asset.identifier}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{asset.asset_type}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-black/40 border border-border/50 px-2 py-0.5 rounded text-xs">
                        {asset.environment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`border px-2 py-0.5 rounded text-xs font-medium bg-black/40 ${getCriticalityColor(asset.criticality)}`}>
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{asset.owner}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${asset.status === 'Monitored' ? 'bg-[hsl(var(--glow-green))] shadow-[0_0_5px_hsl(var(--glow-green))]' : asset.status.includes('Scann') ? 'bg-yellow-500 shadow-[0_0_5px_hsl(var(--glow-amber))] animate-pulse' : 'bg-muted-foreground'}`}></div>
                        {asset.status}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <button 
                        onClick={() => handleScan(asset.id, asset.asset_type)}
                        disabled={asset.status.includes('Scann')}
                        className="bg-black/40 hover:bg-black/60 border border-border/50 hover:border-glow-cyan transition-colors px-3 py-1 rounded text-xs disabled:opacity-50"
                      >
                        Run Scan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
