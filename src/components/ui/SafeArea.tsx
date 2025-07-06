/**
 * 🛡️ SafeArea Component - Responsive & Optimized
 *
 * Componente que crea una zona segura para el contenido,
 * evitando que el scrollbar interfiera con el titlebar,
 * permitiendo elementos fijos y scroll invisible pero funcional
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  hasFixedHeader?: boolean;
  fixedHeaderHeight?: number;
  enableScroll?: boolean;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  className = '',
  hasFixedHeader = false,
  fixedHeaderHeight = 80,
  enableScroll = true,
}) => {
  return (
    <div
      className={cn(
        'safe-area-container',
        // Posicionamiento ABSOLUTO para no interferir con el fondo
        'absolute top-0 left-0',
        // Ancho y altura COMPLETOS
        'w-full h-full',
        // Scroll solo si está habilitado
        enableScroll ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden',
        // Scrollbar invisible SIEMPRE
        'scrollbar-none',
        className
      )}
      style={{
        // Altura dinámica según el estado del panel de licencias
        height: hasFixedHeader
          ? `calc(100vh - 48px - ${fixedHeaderHeight}px)` // Con panel expandido
          : 'calc(100vh - 48px)', // Solo titlebar
        // Posición desde el titlebar + panel si existe
        top: hasFixedHeader ? `${48 + fixedHeaderHeight}px` : '48px',
        // ANCHO COMPLETO sin márgenes - para que el fondo llegue a los bordes
        width: '100vw',
        maxWidth: '100vw',
        left: '0',
        // SIN padding - el contenido interno manejará sus márgenes
        margin: '0',
        padding: '0',
      }}
    >
      {children}
    </div>
  );
};

interface FixedHeaderProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
  zIndex?: number;
}

export const FixedHeader: React.FC<FixedHeaderProps> = ({
  children,
  className = '',
  height = 80,
  zIndex = 40,
}) => {
  return (
    <div
      className={cn(
        'fixed left-0 right-0 bg-[#131414]/95 backdrop-blur-md border-b border-white/10',
        // Responsive padding
        'px-2 sm:px-4 md:px-6',
        className
      )}
      style={{
        top: '48px', // Justo debajo del titlebar
        height: `${height}px`,
        zIndex,
        // Ancho completo - sin scrollbars
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {children}
    </div>
  );
};

interface ScrollableContentProps {
  children: React.ReactNode;
  className?: string;
  hasFixedHeader?: boolean;
  fixedHeaderHeight?: number;
}

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  className = '',
  hasFixedHeader = false,
  fixedHeaderHeight = 80,
}) => {
  return (
    <div
      className={cn(
        'scrollable-content',
        // Padding para evitar que el contenido se oculte bajo headers fijos
        hasFixedHeader ? `pt-[${fixedHeaderHeight}px]` : 'pt-0',
        // Responsive padding bottom
        'pb-6 sm:pb-8 md:pb-12',
        // Responsive spacing
        'space-y-4 sm:space-y-6 md:space-y-8',
        className
      )}
    >
      {children}
    </div>
  );
};

// Componente principal que combina todo
interface SafeAreaLayoutProps {
  children: React.ReactNode;
  fixedHeader?: React.ReactNode;
  className?: string;
  headerHeight?: number;
  enableScroll?: boolean;
}

export const SafeAreaLayout: React.FC<SafeAreaLayoutProps> = ({
  children,
  fixedHeader,
  className = '',
  headerHeight = 80,
  enableScroll = true,
}) => {
  return (
    <div className={cn('safe-area-layout relative', className)}>
      {/* Header fijo si se proporciona */}
      {fixedHeader && (
        <FixedHeader height={headerHeight}>
          {fixedHeader}
        </FixedHeader>
      )}

      {/* Área de contenido con scroll */}
      <SafeArea
        hasFixedHeader={!!fixedHeader}
        fixedHeaderHeight={headerHeight}
        enableScroll={enableScroll}
      >
        <ScrollableContent
          hasFixedHeader={!!fixedHeader}
          fixedHeaderHeight={headerHeight}
        >
          {children}
        </ScrollableContent>
      </SafeArea>
    </div>
  );
};

export default SafeAreaLayout;
