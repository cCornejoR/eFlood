import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import './App.css';
import Homepage from './components/Homepage';
import { HecRas } from './components/HecRas';
import OnboardingModal, { UserData } from './components/OnboardingModal';
import LicenseTitlebar from './components/LicenseTitlebar';
import CustomTitlebar from './components/CustomTitlebar';
// import SafeAreaLayout from './components/ui/SafeArea'; // No usado - HecRas maneja su propio layout
// import { cn } from '@/lib/utils'; // No usado actualmente

type ActiveTab = 'home' | 'hecras';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [isLicensePanelCollapsed, setIsLicensePanelCollapsed] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const savedUserData = localStorage.getItem('eflood-user-data');
    const onboardingCompleted = localStorage.getItem(
      'eflood-onboarding-completed'
    );

    if (savedUserData && onboardingCompleted === 'true') {
      try {
        const parsedData = JSON.parse(savedUserData);
        setUserData(parsedData);
        setIsLicenseValid(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (newUserData: UserData) => {
    setUserData(newUserData);
    setIsLicenseValid(true);
    setShowOnboarding(false);

    // Save to localStorage
    localStorage.setItem('eflood-user-data', JSON.stringify(newUserData));
    localStorage.setItem('eflood-onboarding-completed', 'true');
  };

  const handleOnboardingClose = () => {
    if (!userData || !userData.name || !userData.email) {
      toast.error('Debe completar el registro para usar la aplicación');
      return;
    }
    setShowOnboarding(false);
  };

  const handleNavigation = (tab: string) => {
    // Check if license is valid before allowing navigation to analysis tools
    if (
      tab === 'hecras' &&
      (!userData || !userData.name || !userData.email || !isLicenseValid)
    ) {
      toast.error('Licencia requerida', {
        description:
          'Complete el registro para acceder a las herramientas de análisis',
      });
      setShowOnboarding(true);
      return;
    }
    setActiveTab(tab as ActiveTab);
  };

  return (
    <div className='min-h-screen bg-[#131414]'>
      {/* Custom Titlebar - Fixed at top */}
      <CustomTitlebar
        userData={userData}
        isLicenseValid={isLicenseValid}
        isLicenseCollapsed={isLicensePanelCollapsed}
        onToggleLicenseCollapse={() => setIsLicensePanelCollapsed(!isLicensePanelCollapsed)}
        enableDoubleClickMaximize={true}
      />

      {/* Content Container - Adjusted for fixed titlebar */}
      <div className='pt-12 min-h-screen'>
        {/* License Titlebar */}
        <LicenseTitlebar
          userData={userData}
          isLicenseValid={isLicenseValid}
          isCollapsed={isLicensePanelCollapsed}
          onToggleCollapse={() =>
            setIsLicensePanelCollapsed(!isLicensePanelCollapsed)
          }
        />

        {/* Main Content - Layout responsive al panel de licencias */}
        <div
          className='w-full h-full relative'
          style={{
            width: '100vw',
            maxWidth: '100vw',
            height: isLicensePanelCollapsed
              ? 'calc(100vh - 48px)' // Solo CustomTitlebar (48px)
              : 'calc(100vh - 208px)', // CustomTitlebar (48px) + LicenseTitlebar (160px)
            overflow: 'hidden',
            position: 'relative',
          }}
        >
        {activeTab === 'home' && <Homepage onNavigate={handleNavigation} />}

        {activeTab === 'hecras' && (
          <HecRas
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        onNavigateToAnalyzer={() => {
          setShowOnboarding(false);
          setActiveTab('hecras');
        }}
      />
    </div>
  );
}

export default App;
