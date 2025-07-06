import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Sparkles, Zap, Settings } from 'lucide-react';
import Stepper, { Step } from './ui/Stepper';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (userData: UserData) => void;
  onNavigateToAnalyzer?: () => void;
}

export interface UserData {
  temporarySession: any;
  name: string;
  email: string;
  licenseKey?: string;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  onNavigateToAnalyzer,
}: OnboardingModalProps) {
  const [userData, setUserData] = useState<UserData>({
    temporarySession: null,
    name: '',
    email: '',
    licenseKey: '',
  });
  // const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (_step: number) => {
    // setCurrentStep(step);
  };

  const handleComplete = () => {
    if (!userData.name.trim() || !userData.email.trim()) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      toast.error('Por favor ingrese un email válido');
      return;
    }

    // Generate a temporary license key
    const licenseKey = `EFLOW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const finalUserData = {
      ...userData,
      licenseKey,
    };

    onComplete(finalUserData);
    toast.success('¡Licencia activada exitosamente!');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm'
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
        >
          <div className='w-full max-w-2xl'>
            <Stepper
              initialStep={1}
              onStepChange={handleStepChange}
              onFinalStepCompleted={handleComplete}
              stepCircleContainerClassName='bg-dark border-white/10'
              contentClassName='text-white'
              footerClassName=''
              backButtonText='Anterior'
              nextButtonText='Continuar'
              backButtonProps={{
                className:
                  'px-4 py-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5',
              }}
              nextButtonProps={{
                className:
                  'px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium',
              }}
            >
              {/* Step 1: Welcome */}
              <Step>
                <div className='text-center space-y-4'>
                  <div className='flex justify-center'>
                    <div className='p-3 bg-blue-600/20 rounded-full'>
                      <Sparkles className='h-8 w-8 text-blue-400' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-white mb-2'>
                      ¡Bienvenido a eFlood²!
                    </h3>
                    <p className='text-white/70 text-sm leading-relaxed'>
                      Herramienta profesional para análisis hidráulico 2D con
                      procesamiento HEC-RAS avanzado.
                    </p>
                  </div>
                </div>
              </Step>

              {/* Step 2: Features */}
              <Step>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='flex justify-center mb-3'>
                      <div className='p-3 bg-purple-600/20 rounded-full'>
                        <Zap className='h-8 w-8 text-purple-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-bold text-white mb-3'>
                      Características Principales
                    </h3>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <motion.div
                      className='p-3 bg-white/5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 border border-transparent hover:border-blue-500/30'
                      onClick={() => {
                        if (onNavigateToAnalyzer) {
                          onClose();
                          onNavigateToAnalyzer();
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className='font-semibold text-white mb-1 text-sm flex items-center'>
                        📊 Análisis HDF
                        <span className='ml-1 text-xs bg-blue-600 text-white px-1 py-0.5 rounded-full'>
                          ¡Ir!
                        </span>
                      </h4>
                      <p className='text-white/70 text-xs'>
                        Procesamiento HEC-RAS
                      </p>
                    </motion.div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🔄 Postproceso
                      </h4>
                      <p className='text-white/70 text-xs'>
                        Integración pyHMT2D
                      </p>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        📈 Visualización
                      </h4>
                      <p className='text-white/70 text-xs'>
                        Gráficos interactivos
                      </p>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        💾 Export VTK
                      </h4>
                      <p className='text-white/70 text-xs'>
                        Compatible ParaView
                      </p>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 3: System Requirements */}
              <Step>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='flex justify-center mb-3'>
                      <div className='p-3 bg-green-600/20 rounded-full'>
                        <Settings className='h-8 w-8 text-green-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-bold text-white mb-3'>
                      Requisitos del Sistema
                    </h3>
                  </div>
                  <div className='space-y-3'>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        ✅ SO: Windows 10/11, macOS 10.14+, Linux
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        💾 RAM: 8GB mín, 16GB recomendado
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🔧 Python 3.11+, Rust, Gdal
                      </h4>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 4: Data Privacy */}
              <Step>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='flex justify-center mb-3'>
                      <div className='p-3 bg-orange-600/20 rounded-full'>
                        <Shield className='h-8 w-8 text-orange-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-bold text-white mb-3'>
                      Privacidad y Seguridad
                    </h3>
                  </div>
                  <div className='space-y-3'>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🔒 Procesamiento local de archivos
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🛡️ Sin telemetría ni envío de datos
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🔐 Código abierto y transparente
                      </h4>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 5: License Terms */}
              <Step>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='flex justify-center mb-3'>
                      <div className='p-3 bg-blue-600/20 rounded-full'>
                        <Shield className='h-8 w-8 text-blue-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-bold text-white mb-3'>
                      Términos de Licencia
                    </h3>
                  </div>
                  <div className='space-y-3'>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        📄 Licencia MIT - Uso comercial permitido
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        ⚠️ Sin garantías - Verificar resultados
                      </h4>
                    </div>
                    <div className='p-3 bg-white/5 rounded-lg'>
                      <h4 className='font-semibold text-white mb-1 text-sm'>
                        🤝 Soporte vía GitHub Issues
                      </h4>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 6: User Registration */}
              <Step>
                <div className='space-y-4'>
                  <div className='text-center'>
                    <div className='flex justify-center mb-3'>
                      <div className='p-3 bg-green-600/20 rounded-full'>
                        <User className='h-8 w-8 text-green-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-bold text-white mb-2'>
                      Registro de Usuario
                    </h3>
                    <p className='text-white/70 text-sm'>
                      Complete sus datos para generar su licencia temporal
                    </p>
                  </div>
                  <div className='space-y-3'>
                    <div>
                      <label className='block text-white font-medium mb-1 text-sm'>
                        <User className='inline h-4 w-4 mr-1' />
                        Nombre Completo *
                      </label>
                      <input
                        type='text'
                        value={userData.name}
                        onChange={e =>
                          setUserData({ ...userData, name: e.target.value })
                        }
                        className='w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                        placeholder='Ingrese su nombre completo'
                        required
                      />
                    </div>
                    <div>
                      <label className='block text-white font-medium mb-1 text-sm'>
                        <Mail className='inline h-4 w-4 mr-1' />
                        Correo Electrónico *
                      </label>
                      <input
                        type='email'
                        value={userData.email}
                        onChange={e =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        className='w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
                        placeholder='correo@ejemplo.com'
                        required
                      />
                    </div>
                    <div className='p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg'>
                      <p className='text-blue-200 text-xs'>
                        <Shield className='inline h-3 w-3 mr-1' />
                        Se generará una licencia temporal válida para esta
                        sesión, a futuro este registro permitirá la activación
                        de una licencia permanente mediante correo electrónico.
                      </p>
                    </div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
