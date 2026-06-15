import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <header className="h-16 bg-[hsl(var(--surface-glass)/0.8)] backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search assets, incidents..." 
            className="bg-black/40 border border-border/50 rounded-md py-1.5 pl-8 pr-4 text-sm focus:outline-none focus:border-glow-cyan focus:ring-1 focus:ring-[hsl(var(--glow-cyan))] text-foreground w-64 transition-all"
          />
          <span className="absolute left-2.5 top-2 text-muted-foreground">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Tenant Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase">Tenant:</span>
          <select className="bg-black/40 border border-border/50 rounded-md py-1 px-2 text-sm text-foreground focus:outline-none">
            <option>Acme Corp (Global)</option>
            <option>Wayne Ent (EU)</option>
          </select>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--glow-cyan))] flex items-center justify-center font-bold text-sm">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Sec Admin</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
