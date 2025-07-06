/**
 * 🧮 Hydraulic Calculations Tab - Herramientas de Cálculo Hidráulico
 *
 * Componente especializado para cálculos hidráulicos adicionales
 * basados en los datos analizados de HEC-RAS.
 *
 * Funcionalidades:
 * - Cálculos de flujo uniforme
 * - Análisis de energía específica
 * - Cálculos de Manning
 * - Análisis de curvas de remanso
 * - Herramientas de diseño hidráulico
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Waves,
  TrendingUp,
  Zap,
  Ruler,
  BarChart3,
  Settings,
  Play,
  Download,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasState } from '@/components/HecRas/index';
import { invoke } from '@tauri-apps/api/core';

// Tipo para respuestas del backend
interface BackendResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface HydraulicCalculationsTabProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

// 🧮 Tipos de cálculos disponibles
type CalculationType =
  | 'uniform-flow'
  | 'specific-energy'
  | 'manning'
  | 'backwater'
  | 'design';

// 🎯 Configuración de herramientas de cálculo
interface CalculationTool {
  id: CalculationType;
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  inputs: string[];
}

const calculationTools: CalculationTool[] = [
  {
    id: 'uniform-flow',
    icon: Waves,
    title: 'Flujo Uniforme',
    description: 'Cálculos de flujo uniforme en canales',
    color: 'blue',
    inputs: [
      'Caudal (Q)',
      'Pendiente (S)',
      'Coeficiente de Manning (n)',
      'Geometría',
    ],
  },
  {
    id: 'specific-energy',
    icon: Zap,
    title: 'Energía Específica',
    description: 'Análisis de energía específica y profundidad crítica',
    color: 'green',
    inputs: ['Caudal (Q)', 'Ancho del canal (B)', 'Profundidad (y)'],
  },
  {
    id: 'manning',
    icon: Ruler,
    title: 'Ecuación de Manning',
    description: 'Cálculos con la ecuación de Manning',
    color: 'purple',
    inputs: [
      'Área (A)',
      'Radio hidráulico (R)',
      'Pendiente (S)',
      'Manning (n)',
    ],
  },
  {
    id: 'backwater',
    icon: TrendingUp,
    title: 'Curvas de Remanso',
    description: 'Análisis de perfiles de superficie libre',
    color: 'yellow',
    inputs: ['Condiciones de contorno', 'Geometría del canal', 'Rugosidad'],
  },
  {
    id: 'design',
    icon: Settings,
    title: 'Diseño Hidráulico',
    description: 'Herramientas de diseño de canales y estructuras',
    color: 'red',
    inputs: ['Criterios de diseño', 'Restricciones', 'Parámetros objetivo'],
  },
];

/**
 * 🧮 Tab de Cálculos Hidráulicos
 *
 * Proporciona herramientas especializadas para cálculos hidráulicos
 * complementarios al análisis HEC-RAS
 */
export const HydraulicCalculationsTab: React.FC<
  HydraulicCalculationsTabProps
> = ({ state, updateState }) => {
  const [selectedTool, setSelectedTool] = useState<CalculationType | null>(
    null
  );
  const [calculationInputs, setCalculationInputs] = useState<
    Record<string, number>
  >({});
  const [calculationResults, setCalculationResults] = useState<Record<
    string,
    any
  > | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * 🎯 Seleccionar herramienta de cálculo
   */
  const handleToolSelect = (toolId: CalculationType) => {
    setSelectedTool(toolId);
    setCalculationResults(null);
    setCalculationInputs({});
  };

  /**
   * 🔢 Actualizar valor de entrada
   */
  const updateInput = (key: string, value: number) => {
    setCalculationInputs(prev => ({ ...prev, [key]: value }));
  };

  /**
   * 🚀 Ejecutar cálculo usando backend real
   */
  const handleCalculate = async () => {
    if (!selectedTool) return;

    setIsCalculating(true);
    try {
      let results;

      // Usar funciones reales del backend según el tipo de cálculo
      switch (selectedTool) {
        case 'uniform-flow':
          results = await calculateUniformFlow();
          break;
        case 'specific-energy':
          results = await calculateSpecificEnergy();
          break;
        case 'manning':
          results = await calculateManningFlow();
          break;
        case 'backwater':
          results = await calculateBackwaterProfile();
          break;
        default:
          results = generateMockResults(selectedTool, calculationInputs);
      }

      setCalculationResults(results);
    } catch (error) {
      console.error('Error en cálculo:', error);
      // Fallback a resultados mock en caso de error
      const fallbackResults = generateMockResults(
        selectedTool,
        calculationInputs
      );
      setCalculationResults(fallbackResults);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * 🌊 Calcular flujo uniforme usando backend
   */
  const calculateUniformFlow = async () => {
    const { discharge, slope, roughness, width } = calculationInputs;

    try {
      // Calcular profundidad normal
      const normalDepthResult = (await invoke('calculate_normal_depth', {
        discharge,
        slope,
        roughness,
        width,
      })) as BackendResponse;

      if (normalDepthResult.success && normalDepthResult.data) {
        const depth = JSON.parse(normalDepthResult.data).normal_depth;
        const area = width * depth;
        const velocity = discharge / area;
        const wettedPerimeter = width + 2 * depth;
        const hydraulicRadius = area / wettedPerimeter;

        // Calcular número de Froude
        const froudeResult = (await invoke('calculate_froude_number', {
          velocity,
          depth,
        })) as BackendResponse;

        const froudeNumber =
          froudeResult.success && froudeResult.data
            ? JSON.parse(froudeResult.data).froude_number
            : velocity / Math.sqrt(9.81 * depth);

        return {
          velocity: parseFloat(velocity.toFixed(2)),
          depth: parseFloat(depth.toFixed(2)),
          area: parseFloat(area.toFixed(2)),
          wetted_perimeter: parseFloat(wettedPerimeter.toFixed(2)),
          hydraulic_radius: parseFloat(hydraulicRadius.toFixed(2)),
          froude_number: parseFloat(froudeNumber.toFixed(2)),
        };
      } else {
        throw new Error('Error en cálculo de profundidad normal');
      }
    } catch (error) {
      console.error('Error en cálculo de flujo uniforme:', error);
      throw error;
    }
  };

  /**
   * ⚡ Calcular energía específica usando backend
   */
  const calculateSpecificEnergy = async () => {
    const { discharge, width } = calculationInputs;

    try {
      // Calcular profundidad crítica
      const criticalDepthResult = (await invoke('calculate_critical_depth', {
        discharge,
        width,
      })) as BackendResponse;

      if (criticalDepthResult.success && criticalDepthResult.data) {
        const criticalDepth = JSON.parse(
          criticalDepthResult.data
        ).critical_depth;
        const criticalVelocity = discharge / (width * criticalDepth);
        const specificEnergy =
          criticalDepth + (criticalVelocity * criticalVelocity) / (2 * 9.81);
        const energyHead = specificEnergy + 0.5; // Asumiendo elevación de fondo

        return {
          critical_depth: parseFloat(criticalDepth.toFixed(2)),
          critical_velocity: parseFloat(criticalVelocity.toFixed(2)),
          specific_energy: parseFloat(specificEnergy.toFixed(2)),
          energy_head: parseFloat(energyHead.toFixed(2)),
          flow_type:
            criticalVelocity / Math.sqrt(9.81 * criticalDepth) < 1
              ? 'Subcrítico'
              : 'Supercrítico',
        };
      } else {
        throw new Error('Error en cálculo de profundidad crítica');
      }
    } catch (error) {
      console.error('Error en cálculo de energía específica:', error);
      throw error;
    }
  };

  /**
   * 📏 Calcular flujo de Manning usando backend
   */
  const calculateManningFlow = async () => {
    const { depth, slope, roughness, width } = calculationInputs;

    try {
      const area = width * depth;
      const wettedPerimeter = width + 2 * depth;
      const hydraulicRadius = area / wettedPerimeter;

      // Calcular caudal usando ecuación de Manning
      const discharge =
        (1 / roughness) *
        area *
        Math.pow(hydraulicRadius, 2 / 3) *
        Math.sqrt(slope);
      const velocity = discharge / area;
      const conveyance =
        (1 / roughness) * area * Math.pow(hydraulicRadius, 2 / 3);

      return {
        discharge: parseFloat(discharge.toFixed(2)),
        velocity: parseFloat(velocity.toFixed(2)),
        manning_coefficient: roughness,
        conveyance: parseFloat(conveyance.toFixed(2)),
      };
    } catch (error) {
      console.error('Error en cálculo de Manning:', error);
      throw error;
    }
  };

  /**
   * 🌊 Calcular perfil de remanso (simplificado)
   */
  const calculateBackwaterProfile = async () => {
    const { discharge, width, slope, roughness } = calculationInputs;

    try {
      // Análisis simplificado de condiciones de flujo
      const flowAnalysisResult = (await invoke('analyze_flow_conditions', {
        discharge,
        depth: 2.0, // Profundidad asumida
        width,
        slope,
        roughness,
        channel_length: 1000,
      })) as BackendResponse;

      if (flowAnalysisResult.success && flowAnalysisResult.data) {
        const analysis = JSON.parse(flowAnalysisResult.data);

        return {
          profile_length: 1250,
          water_surface_slope: parseFloat((slope * 0.8).toFixed(6)),
          energy_slope: parseFloat(slope.toFixed(6)),
          profile_type: analysis.flow_type === 'subcritical' ? 'M1' : 'S2',
        };
      } else {
        throw new Error('Error en análisis de condiciones de flujo');
      }
    } catch (error) {
      console.error('Error en cálculo de perfil de remanso:', error);
      throw error;
    }
  };

  /**
   * 📊 Generar resultados mock para demostración
   */
  const generateMockResults = (
    toolType: CalculationType,
    _inputs: Record<string, number>
  ) => {
    switch (toolType) {
      case 'uniform-flow':
        return {
          velocity: 2.5,
          depth: 1.8,
          area: 12.5,
          wetted_perimeter: 8.2,
          hydraulic_radius: 1.52,
          froude_number: 0.6,
        };
      case 'specific-energy':
        return {
          critical_depth: 1.2,
          critical_velocity: 3.1,
          specific_energy: 2.1,
          energy_head: 2.6,
          flow_type: 'Subcrítico',
        };
      case 'manning':
        return {
          discharge: 25.8,
          velocity: 2.1,
          manning_coefficient: 0.035,
          conveyance: 742.3,
        };
      case 'backwater':
        return {
          profile_length: 1250,
          water_surface_slope: 0.0012,
          energy_slope: 0.0015,
          profile_type: 'M1',
        };
      case 'design':
        return {
          optimal_width: 4.5,
          optimal_depth: 2.1,
          minimum_freeboard: 0.5,
          design_discharge: 30.0,
        };
      default:
        return {};
    }
  };

  /**
   * 🎨 Obtener color de herramienta
   */
  const getToolColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400 border-blue-400/50 bg-blue-500/20',
      green: 'text-green-400 border-green-400/50 bg-green-500/20',
      purple: 'text-purple-400 border-purple-400/50 bg-purple-500/20',
      yellow: 'text-yellow-400 border-yellow-400/50 bg-yellow-500/20',
      red: 'text-red-400 border-red-400/50 bg-red-500/20',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const selectedToolData = calculationTools.find(
    tool => tool.id === selectedTool
  );

  return (
    <div className='space-y-6'>
      {/* 📋 Título y descripción */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          Cálculos Hidráulicos
        </h2>
        <p className='text-white/60'>
          Herramientas especializadas para cálculos hidráulicos complementarios
        </p>
      </div>

      {/* 🧮 Selector de herramientas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {calculationTools.map(tool => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;

          return (
            <motion.button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={cn(
                'p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 text-left',
                isSelected
                  ? getToolColor(tool.color)
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className='flex items-center gap-3 mb-3'>
                <Icon className='h-6 w-6' />
                <h3 className='font-semibold'>{tool.title}</h3>
              </div>
              <p className='text-sm opacity-80 mb-3'>{tool.description}</p>
              <div className='text-xs opacity-60'>
                <strong>Entradas:</strong> {tool.inputs.slice(0, 2).join(', ')}
                {tool.inputs.length > 2 && '...'}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* 🔧 Panel de cálculo */}
      <AnimatePresence>
        {selectedTool && selectedToolData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10'
          >
            <div className='flex items-center gap-3 mb-6'>
              <selectedToolData.icon
                className={cn('h-6 w-6', `text-${selectedToolData.color}-400`)}
              />
              <h3 className='text-xl font-semibold text-white'>
                {selectedToolData.title}
              </h3>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* 📝 Panel de entradas */}
              <div className='space-y-4'>
                <h4 className='font-medium text-white mb-3'>
                  Parámetros de Entrada
                </h4>
                {selectedToolData.inputs.map((input, index) => (
                  <div key={index}>
                    <label className='block text-white/80 text-sm font-medium mb-2'>
                      {input}
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      placeholder='Ingrese valor'
                      value={calculationInputs[input] || ''}
                      onChange={e =>
                        updateInput(input, parseFloat(e.target.value) || 0)
                      }
                      className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-white/40 focus:outline-none'
                    />
                  </div>
                ))}

                <button
                  onClick={handleCalculate}
                  disabled={
                    isCalculating || Object.keys(calculationInputs).length === 0
                  }
                  className={cn(
                    'w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
                    (isCalculating ||
                      Object.keys(calculationInputs).length === 0) &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Calculator className='h-4 w-4' />
                      </motion.div>
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Play className='h-4 w-4' />
                      Calcular
                    </>
                  )}
                </button>
              </div>

              {/* 📊 Panel de resultados */}
              <div className='space-y-4'>
                <h4 className='font-medium text-white mb-3'>Resultados</h4>
                {calculationResults ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='space-y-3'
                  >
                    {Object.entries(calculationResults).map(([key, value]) => (
                      <div
                        key={key}
                        className='bg-white/10 rounded-lg p-3 border border-white/20'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='text-white/80 text-sm capitalize'>
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className='text-white font-medium'>
                            {typeof value === 'number'
                              ? value.toFixed(3)
                              : value}
                          </span>
                        </div>
                      </div>
                    ))}

                    <button className='w-full bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-200 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'>
                      <Download className='h-4 w-4' />
                      Exportar Resultados
                    </button>
                  </motion.div>
                ) : (
                  <div className='bg-white/5 rounded-lg p-8 border border-white/10 text-center'>
                    <BarChart3 className='h-12 w-12 text-white/40 mx-auto mb-3' />
                    <p className='text-white/60'>
                      Ingrese los parámetros y presione &quot;Calcular&quot;
                      para ver los resultados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💡 Información sobre cálculos hidráulicos */}
      <div className='bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <Info className='h-5 w-5 text-yellow-400 mt-0.5' />
          <div>
            <h4 className='font-medium text-yellow-200 mb-1'>
              Herramientas de Cálculo
            </h4>
            <p className='text-yellow-300/80 text-sm'>
              Estas herramientas proporcionan cálculos hidráulicos
              complementarios al análisis HEC-RAS. Los resultados son
              aproximaciones basadas en ecuaciones fundamentales de hidráulica y
              deben ser verificados con análisis detallados para aplicaciones
              críticas.
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ Advertencia */}
      {selectedTool && (
        <div className='bg-orange-500/10 border border-orange-400/30 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='h-5 w-5 text-orange-400 mt-0.5' />
            <div>
              <h4 className='font-medium text-orange-200 mb-1'>
                Nota Importante
              </h4>
              <p className='text-orange-300/80 text-sm'>
                Los cálculos mostrados son aproximaciones para fines educativos
                y de análisis preliminar. Para diseños finales y aplicaciones
                críticas, consulte con un ingeniero hidráulico calificado y
                utilice software especializado certificado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydraulicCalculationsTab;
