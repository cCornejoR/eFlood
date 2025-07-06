/**
 * 🧪 Manning Debug Viewer Component
 * Temporary component for debugging Manning values extraction
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TreePine, Bug, Info, AlertTriangle } from 'lucide-react';
import { HecRasState } from '../../index';

interface ManningDebugViewerProps {
  state: HecRasState;
}

export const ManningDebugViewer: React.FC<ManningDebugViewerProps> = ({
  state,
}) => {
  const manningData = state.manningValues;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Bug className="h-6 w-6 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Manning Debug Info</h3>
      </div>

      <div className="space-y-4">
        {/* Raw Data Display */}
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Raw Manning Data
          </h4>
          <pre className="text-xs text-green-400 overflow-x-auto">
            {JSON.stringify(manningData, null, 2)}
          </pre>
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Data Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Has Data:</span>
                <span className={manningData ? 'text-green-400' : 'text-red-400'}>
                  {manningData ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Success Flag:</span>
                <span className={manningData?.success ? 'text-green-400' : 'text-red-400'}>
                  {manningData?.success ? 'True' : 'False'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Has Manning Data:</span>
                <span className={manningData?.manning_data ? 'text-green-400' : 'text-red-400'}>
                  {manningData?.manning_data ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Manning Success:</span>
                <span className={manningData?.manning_data?.success ? 'text-green-400' : 'text-red-400'}>
                  {manningData?.manning_data?.success ? 'True' : 'False'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Data Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Total Zones:</span>
                <span className="text-blue-400">
                  {manningData?.manning_data?.total_zones || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Zones Object:</span>
                <span className="text-blue-400">
                  {manningData?.manning_data?.manning_zones ?
                    Object.keys(manningData.manning_data.manning_zones).length : 0}
                </span>
              </div>
              {manningData?.error && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 font-medium">Error</span>
                  </div>
                  <p className="text-red-300 text-xs">{manningData.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manning Zones Preview */}
        {manningData?.manning_data?.manning_zones && (
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Manning Zones Preview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(manningData.manning_data.manning_zones).slice(0, 6).map(([id, zone]: [string, any]) => (
                <div key={id} className="bg-black/20 rounded p-2">
                  <div className="text-xs">
                    <span className="text-white/60">Zone {id}:</span>
                    <span className="text-white ml-1">{zone.name}</span>
                  </div>
                  <div className="text-xs text-blue-400">n = {zone.value?.toFixed(4)}</div>
                </div>
              ))}
            </div>
            {Object.keys(manningData.manning_data.manning_zones).length > 6 && (
              <p className="text-xs text-white/60 mt-2">
                ... and {Object.keys(manningData.manning_data.manning_zones).length - 6} more zones
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
