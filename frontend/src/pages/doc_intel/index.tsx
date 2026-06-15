import React from 'react';
export const DocIntelPage: React.FC = () => (
  <div className="space-y-6"><h2 className="text-3xl font-bold tracking-tight">Document Intelligence Platform</h2>
  <p className="text-muted-foreground">OCR, handwriting recognition, PDF extraction using PaddleOCR / DocTR / TrOCR.</p>
  <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Engine: PaddleOCR | Avg Confidence: 97% | Tables & Handwriting Supported</div></div>
);
