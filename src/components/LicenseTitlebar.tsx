import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  User,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { UserData } from '@/components/OnboardingModal';

interface LicenseTitlebarProps {
  userData: UserData | null;
  isLicenseValid: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function LicenseTitlebar({
  userData,
  isLicenseValid,
  isCollapsed = false,
  onToggleCollapse,
}: LicenseTitlebarProps) {
  const getLicenseStatus = () => {
    if (!userData || !userData.name || !userData.email) {
      return {
        status: 'invalid',
        text: 'Sin Licencia',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: ShieldX,
      };
    }

    if (isLicenseValid) {
      return {
        status: 'valid',
        text: 'Licencia Activa',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: ShieldCheck,
      };
    }

    return {
      status: 'expired',
      text: 'Licencia Expirada',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: Shield,
    };
  };

  const licenseInfo = getLicenseStatus();
  const IconComponent = licenseInfo.icon;

  return (
    <AnimatePresence>
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className='bg-[#131414] border-b border-white/10 overflow-hidden'
        >
          {/* Header siempre visible cuando no está colapsado */}
          <div className='flex items-center justify-between px-6 py-3'>
        {/* App Title */}
        <div className='flex items-center space-x-3'>
          <h1 className='text-xl font-bold text-white eflow-brand'>eFlood²</h1>
          <span className='text-white/40'>|</span>
          <span className='text-white/70 text-sm'>Panel de licencias</span>
        </div>

        {/* Collapse Toggle Button */}
        <div className='flex items-center space-x-4'>
          {/* License Status Compact */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${licenseInfo.bgColor} ${licenseInfo.borderColor}`}
          >
            <IconComponent className={`h-4 w-4 ${licenseInfo.color}`} />
            <span className={`text-sm font-medium ${licenseInfo.color}`}>
              {licenseInfo.text}
            </span>
          </motion.div>

          {/* Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className='p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200'
            >
              {isCollapsed ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronUp className='h-4 w-4' />
              )}
            </button>
          )}
        </div>
      </div>

          {/* Detailed Content */}
          <div className='px-6 pb-3 space-y-3'>
              {/* Detailed License Info */}
              <div className='flex items-center justify-between'>
                {/* User Info */}
                {userData && userData.name && (
                  <div className='flex items-center space-x-2 text-sm text-white/70'>
                    <User className='h-4 w-4' />
                    <span>{userData.name}</span>
                  </div>
                )}

                {/* License Key Display (truncated) */}
                {userData && userData.licenseKey && isLicenseValid && (
                  <div className='text-xs text-white/50 font-mono'>
                    {userData.licenseKey.substring(0, 12)}...
                  </div>
                )}
              </div>

              {/* Additional License Info */}
              {userData && userData.licenseKey && isLicenseValid && (
                <div className='pt-2 border-t border-white/5'>
                  <div className='flex items-center justify-between text-xs text-white/50'>
                    <span>Licencia aprobada a: {userData.email}</span>
                    <span>
                      ¿Sesión temporal?:{' '}
                      {userData.temporarySession ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
