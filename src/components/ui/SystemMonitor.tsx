import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// 🎯 Componente de Tooltip
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md whitespace-nowrap z-50 border border-white/20"
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
        </motion.div>
      )}
    </div>
  );
};

// 🎯 Interfaz para las métricas del sistema
interface SystemMetrics {
  memory_usage_mb: number;
  cpu_usage_percent: number;
  gpu_usage_percent: number;
  total_memory_mb: number;
  available_memory_mb: number;
  process_id: number;
  cpu_cores: number;
}

interface SystemMonitorProps {
  className?: string;
}

/**
 * 📊 Componente de Monitoreo del Sistema
 * 
 * Muestra métricas en tiempo real del uso de recursos de la aplicación
 * de forma minimalista en el footer.
 */
export const SystemMonitor: React.FC<SystemMonitorProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Función para obtener métricas del sistema
  const fetchSystemMetrics = async () => {
    try {
      const result = await invoke<SystemMetrics>('get_system_metrics');
      setMetrics(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError('Error al obtener métricas');
    } finally {
      setIsLoading(false);
    }
  };

  // 🕐 Actualizar métricas cada 3 segundos
  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🎨 Función para obtener color basado en el porcentaje de uso
  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  // 📱 Formatear memoria en MB o GB
  const formatMemory = (mb: number) => {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Monitor className="h-3 w-3 text-white/40 animate-pulse" />
        <span className="text-xs text-white/40">Cargando...</span>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Monitor className="h-3 w-3 text-red-400" />
        <span className="text-xs text-red-400">Error</span>
      </div>
    );
  }

  const memoryUsagePercent = (metrics.memory_usage_mb / metrics.total_memory_mb) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* 💾 Memoria */}
      <Tooltip content={`Memoria RAM utilizada por eFlood² (${memoryUsagePercent.toFixed(1)}% del total)`}>
        <div className="flex items-center gap-1 cursor-help">
          <MemoryStick className="h-3 w-3 text-white/60" />
          <span className={`text-xs font-mono ${getUsageColor(memoryUsagePercent)}`}>
            {formatMemory(metrics.memory_usage_mb)}
          </span>
        </div>
      </Tooltip>

      {/* 🔧 CPU */}
      <Tooltip content={`Uso del procesador por el sistema (${metrics.cpu_cores} núcleos)`}>
        <div className="flex items-center gap-1 cursor-help">
          <Cpu className="h-3 w-3 text-white/60" />
          <span className={`text-xs font-mono ${getUsageColor(metrics.cpu_usage_percent)}`}>
            {metrics.cpu_usage_percent.toFixed(0)}%
          </span>
        </div>
      </Tooltip>

      {/* 🎮 GPU (si está disponible) */}
      {metrics.gpu_usage_percent > 0 && (
        <Tooltip content="Uso de la tarjeta gráfica (GPU)">
          <div className="flex items-center gap-1 cursor-help">
            <HardDrive className="h-3 w-3 text-white/60" />
            <span className={`text-xs font-mono ${getUsageColor(metrics.gpu_usage_percent)}`}>
              {metrics.gpu_usage_percent.toFixed(0)}%
            </span>
          </div>
        </Tooltip>
      )}

      {/* 📊 Indicador visual de estado */}
      <Tooltip content="Sistema funcionando correctamente">
        <div className="flex items-center cursor-help">
          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </Tooltip>
    </motion.div>
  );
};

export default SystemMonitor;
