import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/dashboard';
import { AssetsPage } from './pages/assets';
import { SoarPage } from './pages/soar';
import { ThreatIntelPage } from './pages/intel';
import { ReportsPage } from './pages/reports';
import { AuditPage } from './pages/audit';
import { EndpointsPage } from './pages/endpoints';
import { SiemPage } from './pages/siem';
import { EvidencePage } from './pages/evidence';
import { CompliancePage } from './pages/compliance';
import { MalwarePage } from './pages/malware';
import { ForensicsPage } from './pages/forensics';
import { SettingsPage } from './pages/settings';
import { DomainsPage } from './pages/domains';
import { VulnerabilitiesPage } from './pages/vulnerabilities';
import { FindingsPage } from './pages/findings';
import { CloudSecurityPage } from './pages/cloud';
import { ContainerSecurityPage } from './pages/containers';
import { GraphExplorerPage } from './pages/graph';
import { CtemPage } from './pages/ctem';
import { AttackPathPage } from './pages/attack_path';
import { PosturePage } from './pages/posture';
import { SocPage } from './pages/soc';
import { PurpleTeamPage } from './pages/purple_team';
import { ThreatHuntingPage } from './pages/threat_hunting';
import { MsspPage } from './pages/mssp';
import { MarketplacePage } from './pages/marketplace';
import { DeveloperPage } from './pages/developer';
import { SupplyChainPage } from './pages/supply_chain';
import { AssistantPage } from './pages/assistant';
import { ResiliencePage } from './pages/resilience';
import { LoginPage } from './pages/auth/Login';
import { DigitalTwinPage } from './pages/digital_twin';
import { ExecRiskPage } from './pages/exec_risk';
import { TprmPage } from './pages/tprm';
import { InsurancePage } from './pages/insurance';
import { BenchmarkingPage } from './pages/benchmarking';
import { DspmPage } from './pages/dspm';
import { IdentityRiskPage } from './pages/identity_risk';
import { ControlEffectivenessPage } from './pages/control_effectiveness';
import { AutoInvestigatePage } from './pages/auto_investigate';
import { FederationPage } from './pages/federation';
import { LicensingPage } from './pages/licensing';
import { CustomerSuccessPage } from './pages/customer_success';
import { CyberEconPage } from './pages/cyber_econ';
import { LakehousePage } from './pages/lakehouse';
import { ObservatoryPage } from './pages/observatory';
import { ResearchPlatformPage } from './pages/research_platform';
import { IndustryEditionPage } from './pages/industry_edition';
import { CyberRangePage } from './pages/cyber_range';
import { PartnerEcosystemPage } from './pages/partner_ecosystem';
import { ProductAnalyticsPage } from './pages/product_analytics';
import { KnowledgePlatformPage } from './pages/knowledge_platform';
import { GlobalCommandPage } from './pages/global_command';
import { IntelCapturePage } from './pages/intel_capture';
import { VoiceIntelPage } from './pages/voice_intel';
import { DocIntelPage } from './pages/doc_intel';
import { ConversationIntelPage } from './pages/conversation_intel';
import { MultimediaEvidencePage } from './pages/multimedia_evidence';
import { KgAiPage } from './pages/kg_ai';
import { AutoAssistantPage } from './pages/auto_assistant';
import { MissionOrchestratorPage } from './pages/mission_orchestrator';
import { DecisionSupportPage } from './pages/decision_support';
import { GlobalCloudPage } from './pages/global_cloud';
import { isAuthenticated } from './services/auth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/endpoints" element={<EndpointsPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/soar" element={<SoarPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/intel" element={<ThreatIntelPage />} />
                <Route path="/malware" element={<MalwarePage />} />
                <Route path="/forensics" element={<ForensicsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/audit" element={<AuditPage />} />
                <Route path="/domains" element={<DomainsPage />} />
                <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
                <Route path="/findings" element={<FindingsPage />} />
                <Route path="/cloud" element={<CloudSecurityPage />} />
                <Route path="/containers" element={<ContainerSecurityPage />} />
                <Route path="/graph" element={<GraphExplorerPage />} />
                <Route path="/ctem" element={<CtemPage />} />
                <Route path="/attack-path" element={<AttackPathPage />} />
                <Route path="/posture" element={<PosturePage />} />
                <Route path="/soc" element={<SocPage />} />
                <Route path="/purple-team" element={<PurpleTeamPage />} />
                <Route path="/threat-hunting" element={<ThreatHuntingPage />} />
                <Route path="/mssp" element={<MsspPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/developer" element={<DeveloperPage />} />
                <Route path="/supply-chain" element={<SupplyChainPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/resilience" element={<ResiliencePage />} />
                <Route path="/digital-twin" element={<DigitalTwinPage />} />
                <Route path="/exec-risk" element={<ExecRiskPage />} />
                <Route path="/tprm" element={<TprmPage />} />
                <Route path="/insurance" element={<InsurancePage />} />
                <Route path="/benchmarking" element={<BenchmarkingPage />} />
                <Route path="/dspm" element={<DspmPage />} />
                <Route path="/identity-risk" element={<IdentityRiskPage />} />
                <Route path="/control-effectiveness" element={<ControlEffectivenessPage />} />
                <Route path="/auto-investigate" element={<AutoInvestigatePage />} />
                <Route path="/federation" element={<FederationPage />} />
                <Route path="/licensing" element={<LicensingPage />} />
                <Route path="/customer-success" element={<CustomerSuccessPage />} />
                <Route path="/cyber-econ" element={<CyberEconPage />} />
                <Route path="/lakehouse" element={<LakehousePage />} />
                <Route path="/observatory" element={<ObservatoryPage />} />
                <Route path="/research-platform" element={<ResearchPlatformPage />} />
                <Route path="/industry-edition" element={<IndustryEditionPage />} />
                <Route path="/cyber-range" element={<CyberRangePage />} />
                <Route path="/partner-ecosystem" element={<PartnerEcosystemPage />} />
                <Route path="/product-analytics" element={<ProductAnalyticsPage />} />
                <Route path="/knowledge-platform" element={<KnowledgePlatformPage />} />
                <Route path="/global-command" element={<GlobalCommandPage />} />
                <Route path="/intel-capture" element={<IntelCapturePage />} />
                <Route path="/voice-intel" element={<VoiceIntelPage />} />
                <Route path="/doc-intel" element={<DocIntelPage />} />
                <Route path="/conversation-intel" element={<ConversationIntelPage />} />
                <Route path="/multimedia-evidence" element={<MultimediaEvidencePage />} />
                <Route path="/kg-ai" element={<KgAiPage />} />
                <Route path="/auto-assistant" element={<AutoAssistantPage />} />
                <Route path="/mission-orchestrator" element={<MissionOrchestratorPage />} />
                <Route path="/decision-support" element={<DecisionSupportPage />} />
                <Route path="/global-cloud" element={<GlobalCloudPage />} />
                <Route path="*" element={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="text-4xl">🚧</div>
                      <h2 className="text-xl text-muted-foreground font-mono">Module Under Construction</h2>
                    </div>
                  </div>
                } />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
