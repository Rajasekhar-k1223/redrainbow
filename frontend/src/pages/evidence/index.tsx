import React, { useEffect, useState, useRef } from 'react';
import { fetchEvidence, uploadEvidence, downloadEvidenceUrl } from '../../services/api';

interface Evidence {
  id: string;
  title: string;
  description: string;
  file_name: string;
  file_size: number;
  sha256: string;
  evidence_type: string;
  source_vector: string;
  uploaded_by: string;
  created_at: string;
}

export const EvidencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEvidence = async () => {
    try {
      const data = await fetchEvidence();
      setEvidenceList(data.evidence || []);
    } catch (err) {
      console.error("Failed to load evidence", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const title = prompt("Enter a title for this forensic artifact:") || file.name;
      const type = prompt("Enter evidence type (e.g., PCAP, Binary, Memory Dump):") || "Other";
      
      await uploadEvidence(file, title, type);
      await loadEvidence();
      alert("Artifact securely uploaded to vault and cryptographically hashed.");
    } catch (err) {
      console.error(err);
      alert("Failed to upload evidence.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evidence Vault</h2>
          <p className="text-muted-foreground mt-1">Immutable Chain of Custody for Forensic Artifacts (SHA-256 Validated).</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        
        <button 
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.8] text-black transition-colors px-6 py-2 rounded-md font-bold disabled:opacity-50"
        >
          {uploading ? 'Encrypting & Uploading...' : 'Upload Artifact'}
        </button>
      </div>

      <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            Decrypting vault ledger...
          </div>
        ) : evidenceList.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border/50 m-6 rounded-xl flex flex-col items-center justify-center">
            <span className="text-4xl mb-4 opacity-50">🗄</span>
            <p>The vault is empty.</p>
            <p className="text-xs mt-2">Upload forensic artifacts to securely establish chain of custody.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/40 uppercase font-mono border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Artifact Title</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">SHA-256 Hash</th>
                  <th className="px-6 py-4 font-semibold">Size (KB)</th>
                  <th className="px-6 py-4 font-semibold">Chain of Custody</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {evidenceList.map((ev) => (
                  <tr key={ev.id} className="hover:bg-black/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-white group-hover:text-glow-cyan transition-colors">
                      {ev.title}
                      <div className="text-xs font-mono text-muted-foreground font-normal mt-1">{ev.file_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-black/40 px-2 py-1 rounded text-xs border border-border/50 font-mono text-blue-300">
                        {ev.evidence_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-glow-green">
                      <div className="truncate w-32" title={ev.sha256}>{ev.sha256}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">
                      {Math.round(ev.file_size / 1024)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      <div>{new Date(ev.created_at).toLocaleString()}</div>
                      <div>by {ev.uploaded_by}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <a href={downloadEvidenceUrl(ev.id)} download className="bg-black/40 hover:bg-black/60 border border-border/50 hover:border-glow-cyan transition-colors px-3 py-1 rounded text-xs inline-block text-white">
                        Download Securely
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
