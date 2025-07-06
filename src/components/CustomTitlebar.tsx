/**
 * 🎯 Custom Titlebar Component - NATIVO Y MEJORADO
 *
 * Titlebar completamente nativo que reemplaza al de Tauri con:
 * - Funcionalidad de arrastre nativa robusta
 * - Botones de control de ventana nativos
 * - Logo centrado de la aplicación
 * - Manejo avanzado de estados de ventana
 * - Compatibilidad completa con comandos nativos de Tauri
 * - Soporte para doble clic para maximizar
 * - Manejo robusto de errores
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Tipo personalizado para WebkitAppRegion
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}
import { motion } from 'framer-motion';
import {
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldCheck,
  ShieldX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import logoImage from '@/assets/logo.svg';
import { UserData } from '@/components/OnboardingModal';
import {
  minimizeWindow,
  toggleMaximizeWindow,
  closeWindow,
  // startDragging,
  getWindowState,
  listenToWindowStateChanges,
  type WindowState,
} from '@/lib/windowControls';

interface CustomTitlebarProps {
  title?: string;
  className?: string;
  userData?: UserData | null;
  isLicenseValid?: boolean;
  isLicenseCollapsed?: boolean;
  onToggleLicenseCollapse?: () => void;
  enableDoubleClickMaximize?: boolean;
  isAnalyzerMode?: boolean;
}

// Tipos para manejo de errores del titlebar
interface TitlebarError {
  id: string;
  message: string;
  timestamp: number;
  type: 'window-control' | 'drag' | 'state';
  details?: Record<string, unknown>;
}

// Estado interno del titlebar
interface TitlebarState {
  isProcessing: boolean;
  errors: TitlebarError[];
  lastAction: string | null;
}

/**
 * 🎨 Custom Titlebar - COMPLETAMENTE NATIVO
 *
 * Titlebar completamente funcional con controles nativos, logo centrado,
 * manejo robusto de estados y funcionalidad de arrastre avanzada
 */
export const CustomTitlebar: React.FC<CustomTitlebarProps> = ({
  title = 'eFlood²',
  className = '',
  userData = null,
  isLicenseValid = false,
  isLicenseCollapsed = false,
  onToggleLicenseCollapse,
  enableDoubleClickMaximize = true,
  isAnalyzerMode = false,
}) => {
  // Estados de ventana
  const [windowState, setWindowState] = useState<WindowState>({
    isMaximized: false,
    isMinimized: false,
    isFocused: true,
    isFullscreen: false,
  });

  // Estados de UI
  const [isHovered, setIsHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Estado interno del titlebar
  const [titlebarState, setTitlebarState] = useState<TitlebarState>({
    isProcessing: false,
    errors: [],
    lastAction: null,
  });

  // Referencias
  const titlebarRef = useRef<HTMLDivElement>(null);

  // Función para agregar errores
  const addError = useCallback(
    (error: Omit<TitlebarError, 'id' | 'timestamp'>) => {
      const newError: TitlebarError = {
        ...error,
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: Date.now(),
      };

      setTitlebarState(prev => ({
        ...prev,
        errors: [...prev.errors.slice(-4), newError], // Mantener solo los últimos 5 errores
      }));

      // Log para desarrollo
      if (import.meta.env.DEV) {
        console.error(
          `[Titlebar ${error.type}]:`,
          error.message,
          error.details
        );
      }

      // Auto-remover error después de 5 segundos
      setTimeout(() => {
        setTitlebarState(prev => ({
          ...prev,
          errors: prev.errors.filter(e => e.id !== newError.id),
        }));
      }, 5000);
    },
    []
  );

  // Función para establecer estado de procesamiento
  const setProcessing = useCallback(
    (isProcessing: boolean, action?: string) => {
      setTitlebarState(prev => ({
        ...prev,
        isProcessing,
        lastAction: action || prev.lastAction,
      }));
    },
    []
  );

  // Inicializar estado de ventana y listeners
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initializeWindowState = async () => {
      try {
        // Obtener estado inicial
        const initialState = await getWindowState();
        setWindowState(initialState);

        // Configurar listeners para cambios de estado
        cleanup = await listenToWindowStateChanges(newState => {
          setWindowState(prev => ({ ...prev, ...newState }));
        });

        if (import.meta.env.DEV) {
          console.log(
            '[CustomTitlebar]: Window state initialized successfully',
            initialState
          );
        }
      } catch (error) {
        addError({
          type: 'state',
          message: 'Failed to initialize window state',
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    };

    initializeWindowState();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [addError]);

  /**
   * 🔽 Minimizar ventana con manejo robusto de errores
   */
  const handleMinimize = useCallback(async () => {
    try {
      setProcessing(true, 'minimize');
      await minimizeWindow();
    } catch (error) {
      addError({
        type: 'window-control',
        message: 'Failed to minimize window',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setProcessing(false);
    }
  }, [addError, setProcessing]);

  /**
   * 📐 Maximizar/Restaurar ventana con manejo robusto de errores
   */
  const handleMaximize = useCallback(async () => {
    try {
      setProcessing(true, 'maximize');
      await toggleMaximizeWindow();
    } catch (error) {
      addError({
        type: 'window-control',
        message: 'Failed to toggle window maximize state',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setProcessing(false);
    }
  }, [addError, setProcessing]);

  /**
   * ❌ Cerrar ventana con manejo robusto de errores
   */
  const handleClose = useCallback(async () => {
    try {
      setProcessing(true, 'close');
      await closeWindow();
    } catch (error) {
      addError({
        type: 'window-control',
        message: 'Failed to close window',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      setProcessing(false); // Solo establecer a false si el cierre falló
    }
  }, [addError, setProcessing]);

  /**
   * 🖱️ Manejar arrastre de ventana
   */
  // const handleMouseDown = useCallback(
  //   (e: React.MouseEvent) => {
  //     const target = e.target as HTMLElement;
  //     const isInteractiveElement = target.closest(
  //       'button, input, [data-no-drag]'
  //     );

  //     if (!isInteractiveElement) {
  //       try {
  //         startDragging();
  //       } catch (error) {
  //         addError({
  //           type: 'drag',
  //           message: 'Failed to start window dragging',
  //           details: {
  //             error: error instanceof Error ? error.message : String(error),
  //           },
  //         });
  //       }
  //     }
  //   },
  //   [addError]
  // );

  /**
   * 🖱️ Manejar doble clic para maximizar/restaurar
   */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enableDoubleClickMaximize) return;

      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest(
        'button, input, [data-no-drag]'
      );

      if (!isInteractiveElement) {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < 300) {
          handleMaximize();
        }
        setLastClickTime(currentTime);
      }
    },
    [enableDoubleClickMaximize, lastClickTime, handleMaximize]
  );

  return (
    <div
      ref={titlebarRef}
      className={`
        select-none h-12 bg-[#131414]/95 backdrop-blur-md border-b border-white/10
        flex items-center justify-between
        ${!windowState.isFocused ? 'opacity-90' : 'opacity-100'}
        ${titlebarState.isProcessing ? 'pointer-events-none' : ''}
        ${className}
      `}
      style={{
        WebkitAppRegion: 'drag',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Área de arrastre está en el div principal */}

      {/* 🔧 Botón de colapsar licencias */}
      <div className='flex items-center h-full pl-4 z-10'>
        {onToggleLicenseCollapse && (
          <motion.button
            onClick={onToggleLicenseCollapse}
            className='flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200'
            style={{ WebkitAppRegion: 'no-drag' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={
              isLicenseCollapsed
                ? 'Expandir panel de licencias'
                : 'Colapsar panel de licencias'
            }
          >
            {/* Badge de estado de licencia */}
            <div className='relative'>
              {isLicenseValid && userData?.name ? (
                <ShieldCheck className='h-4 w-4 text-green-400' />
              ) : userData?.name ? (
                <Shield className='h-4 w-4 text-orange-400' />
              ) : (
                <ShieldX className='h-4 w-4 text-red-400' />
              )}

              {/* Badge indicator */}
              {isLicenseValid && userData?.name && (
                <div className='absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a0a]' />
              )}
            </div>

            {/* Chevron */}
            {isLicenseCollapsed ? (
              <ChevronDown className='h-3 w-3' />
            ) : (
              <ChevronUp className='h-3 w-3' />
            )}

            <span className='text-xs font-medium hidden sm:inline'>
              {isLicenseCollapsed ? 'Licencias' : 'Ocultar'}
            </span>
          </motion.button>
        )}
      </div>

      {/* 🎨 Logo y título centrado - perfectamente alineados */}
      <motion.div
        className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10 select-none cursor-move'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onDoubleClick={handleDoubleClick}
      >
        <motion.img
          src={logoImage}
          alt='eFlood² Logo'
          className='h-6 w-6 object-contain pointer-events-none flex-shrink-0'
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        />
        <motion.h1
          className='text-lg font-bold text-white eflow-brand pointer-events-none leading-none'
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {isAnalyzerMode ? (
            <span className='flex items-center gap-2'>
              {title}
              <span className='px-2 py-1 text-sm bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/30 rounded-lg text-blue-300 font-medium'>
                Analyzer
              </span>
            </span>
          ) : (
            title
          )}
        </motion.h1>
      </motion.div>

      {/* 🔲 Botones de control de ventana */}
      <div className='flex items-center h-full z-10'>
        {/* Botón Minimizar */}
        <motion.button
          onClick={handleMinimize}
          disabled={titlebarState.isProcessing}
          className={`
            flex items-center justify-center w-12 h-full text-white/60 hover:text-white
            hover:bg-white/10 transition-all duration-200
            ${titlebarState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ WebkitAppRegion: 'no-drag' }}
          whileHover={{ scale: titlebarState.isProcessing ? 1 : 1.1 }}
          whileTap={{ scale: titlebarState.isProcessing ? 1 : 0.95 }}
          title='Minimizar'
        >
          <Minus className='h-4 w-4' />
        </motion.button>

        {/* Botón Maximizar/Restaurar */}
        <motion.button
          onClick={handleMaximize}
          disabled={titlebarState.isProcessing}
          className={`
            flex items-center justify-center w-12 h-full text-white/60 hover:text-white
            hover:bg-white/10 transition-all duration-200
            ${titlebarState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ WebkitAppRegion: 'no-drag' }}
          whileHover={{ scale: titlebarState.isProcessing ? 1 : 1.1 }}
          whileTap={{ scale: titlebarState.isProcessing ? 1 : 0.95 }}
          title={windowState.isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {windowState.isMaximized ? (
            <Minimize2 className='h-4 w-4' />
          ) : (
            <Maximize2 className='h-4 w-4' />
          )}
        </motion.button>

        {/* Botón Cerrar */}
        <motion.button
          onClick={handleClose}
          disabled={titlebarState.isProcessing}
          className={`
            flex items-center justify-center w-12 h-full text-white/60 hover:text-white
            hover:bg-red-500/20 hover:text-red-300 transition-all duration-200
            ${titlebarState.isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ WebkitAppRegion: 'no-drag' }}
          whileHover={{ scale: titlebarState.isProcessing ? 1 : 1.1 }}
          whileTap={{ scale: titlebarState.isProcessing ? 1 : 0.95 }}
          title='Cerrar'
        >
          <X className='h-4 w-4' />
        </motion.button>
      </div>

      {/* 🌟 Efecto de brillo al hacer hover */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none'
        initial={{ opacity: 0, x: '-100%' }}
        animate={
          isHovered ? { opacity: 1, x: '100%' } : { opacity: 0, x: '-100%' }
        }
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default CustomTitlebar;
