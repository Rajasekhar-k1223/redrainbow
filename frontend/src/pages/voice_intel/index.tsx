import React from 'react';
export const VoiceIntelPage: React.FC = () => (
  <div className="space-y-6"><h2 className="text-3xl font-bold tracking-tight">Voice Intelligence Platform</h2>
  <p className="text-muted-foreground">Speech-to-text, speaker recognition, multi-language audio search using Whisper / NeMo.</p>
  <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Engine: Faster-Whisper | Confidence: 94% | Speaker Diarization Active</div></div>
);
