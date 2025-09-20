import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardView } from './views/DashboardView';
import { CampaignManagementView } from './views/CampaignManagementView';
import { FundUtilizationView } from './views/FundUtilizationView';
import { WorkerManagementView } from './views/WorkerManagementView';
import { AnalyticsView } from './views/AnalyticsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

export default function NgoDashboardPage() {
  const { ngoId } = useParams();
  const [activeView, setActiveView] = useState('dashboard');
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ngoId) {
      fetchNgoData(ngoId);
    }
  }, [ngoId]);

  const fetchNgoData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setNgoData(result.data);
      } else {
        setError('NGO not found');
      }
    } catch (err) {
      setError('Failed to fetch NGO data');
      console.error('Error fetching NGO data:', err);
    } finally {
      setLoading(false);
    }
  };

  const ngoName = ngoData?.ngoName || 'Hope Foundation';

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView ngoName={ngoName} ngoData={ngoData} />;
      case 'campaigns': return <CampaignManagementView ngoName={ngoName} ngoData={ngoData} />;
      case 'utilization': return <FundUtilizationView ngoName={ngoName} ngoData={ngoData} />;
      case 'workers': return <WorkerManagementView ngoName={ngoName} ngoData={ngoData} />;
      case 'analytics': return <AnalyticsView ngoName={ngoName} ngoData={ngoData} />;
      case 'notifications': return <NotificationsView ngoName={ngoName} ngoData={ngoData} />;
      case 'settings': return <SettingsView ngoName={ngoName} ngoData={ngoData} />;
      default: return <DashboardView ngoName={ngoName} ngoData={ngoData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex flex-1 flex-col">
        <Header activeView={activeView} />
        <main className="flex-1 p-6">{renderView()}</main>
      </div>
    </div>
  );
}