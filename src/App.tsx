import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SimulationControlBar } from './components/common/SimulationControlBar';
import { AuthProvider } from './context/AuthContext';
import { MonitoringProvider } from './context/MonitoringContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AlertsPage } from './pages/AlertsPage';
import { CompetitionDemoPage } from './pages/CompetitionDemoPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeviceManagementPage } from './pages/DeviceManagementPage';
import { FatigueAnalysisPage } from './pages/FatigueAnalysisPage';
import { HardwareIntegrationGuidePage } from './pages/HardwareIntegrationGuidePage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { MovementPosturePage } from './pages/MovementPosturePage';
import { ReportsPage } from './pages/ReportsPage';
import { SensorAnalyticsPage } from './pages/SensorAnalyticsPage';
import { SessionsPage } from './pages/SessionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NavItem } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={tab => setCurrentTab(tab)} />;
      case 'competition-demo':
        return <CompetitionDemoPage />;
      case 'live-monitoring':
        return <LiveMonitoringPage />;
      case 'analytics':
        return <SensorAnalyticsPage />;
      case 'fatigue':
        return <FatigueAnalysisPage />;
      case 'movement':
        return <MovementPosturePage />;
      case 'alerts':
        return <AlertsPage />;
      case 'sessions':
        return <SessionsPage />;
      case 'devices':
        return (
          <DeviceManagementPage
            onNavigateToGuide={() => setCurrentTab('hardware-guide')}
          />
        );
      case 'hardware-guide':
        return (
          <HardwareIntegrationGuidePage
            onNavigateToDevices={() => setCurrentTab('devices')}
          />
        );
      case 'profile':
        return <UserProfilePage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={tab => setCurrentTab(tab)} />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#07090e] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      <Header
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Simulator Control Bar horizontally aligned beside sidebar */}
          <SimulationControlBar />

          <main className="p-3.5 lg:p-6 min-w-0 overflow-y-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MonitoringProvider>
          <MainApp />
        </MonitoringProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
