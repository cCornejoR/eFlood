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
  const [isLicensePanelCollapsed, setIsLicensePanelCollapsed] = useState(true);

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

    // Collapse license panel when entering analyzer
    if (tab === 'hecras') {
      setIsLicensePanelCollapsed(true);
    }

    setActiveTab(tab as ActiveTab);
  };

  return (
    <div className='app-container'>
      {/* Native Titlebar - Fixed at top */}
      <div className='app-titlebar'>
        <CustomTitlebar
          userData={userData}
          isLicenseValid={isLicenseValid}
          isLicenseCollapsed={isLicensePanelCollapsed}
          onToggleLicenseCollapse={() =>
            setIsLicensePanelCollapsed(!isLicensePanelCollapsed)
          }
          enableDoubleClickMaximize={true}
          className='titlebar-native'
          isAnalyzerMode={activeTab === 'hecras'}
        />
      </div>

      {/* Main Content Area */}
      <div className='app-content'>
        {/* License Panel */}
        {!isLicensePanelCollapsed && (
          <LicenseTitlebar
            userData={userData}
            isLicenseValid={isLicenseValid}
            isCollapsed={isLicensePanelCollapsed}
            onToggleCollapse={() =>
              setIsLicensePanelCollapsed(!isLicensePanelCollapsed)
            }
          />
        )}

        {/* Page Content */}
        <div className='desktop-container'>
          <div className='desktop-content scrollbar-hidden'>
            {activeTab === 'home' && <Homepage onNavigate={handleNavigation} />}
            {activeTab === 'hecras' && (
              <HecRas
                onNavigateHome={() => setActiveTab('home')}
                isLicensePanelCollapsed={isLicensePanelCollapsed}
              />
            )}
          </div>
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
