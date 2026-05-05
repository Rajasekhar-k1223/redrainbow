import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 'reverse_engineering',
    title: 'Reverse Engineering',
    os: 'BlackArch',
    description: 'Decipher proprietary logic or hidden algorithms.',
    playbook: [
      'Identification with binwalk',
      'String analysis and diagnostic search',
      'Control flow mapping in Ghidra',
      'Dynamic analysis with gdb/strace'
    ]
  },
  {
    id: 'malware_analysis',
    title: 'Malware Analysis',
    os: 'REMnux',
    description: 'Analyze suspicious binaries and behavior.',
    playbook: [
      'Isolated behavioral monitoring',
      'Network traffic simulation (fakedns)',
      'Memory forensics with volatility',
      'Yara rule matching'
    ]
  },
  {
    id: 'api_penetration',
    title: 'API Penetration',
    os: 'SECHub',
    description: 'Identify flaws in web API services.',
    playbook: [
      'Endpoint discovery and mapping',
      'Authentication bypass testing',
      'Input fuzzing and CRLF injection',
      'Rate limit validation'
    ]
  }
];

export default function ScenarioOrchestrator({ onSelectOS }) {
  const [activeScenario, setActiveScenario] = useState(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveScenario(s);
              onSelectOS(s.os);
            }}
            className={`p-6 rounded-2xl border transition-all text-left group ${
              activeScenario?.id === s.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 bg-white/5 hover:border-slate-500'
            }`}
          >
            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition">
              {s.title}
            </h3>
            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{s.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {s.os}
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">GO &rarr;</span>
            </div>
          </button>
        ))}
      </div>

      {activeScenario && (
        <div className="glass rounded-2xl p-6 glow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Active Playbook: {activeScenario.title}</h4>
            <span className="text-xs text-slate-400 italic">Target OS: {activeScenario.os}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {activeScenario.playbook.map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-slate-800">
                <span className="flex-none w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] flex items-center justify-center border border-emerald-500/40">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
