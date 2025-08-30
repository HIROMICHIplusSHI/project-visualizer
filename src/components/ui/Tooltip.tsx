import React, { useState } from 'react';
import type { TooltipProps } from '../../types/components';

// TODO(human): TooltipProps 型定義を components.ts に移行完了

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'bottom' 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: '#374151',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      whiteSpace: 'nowrap' as const,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    };

    const positions = {
      top: {
        ...baseStyle,
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)'
      },
      bottom: {
        ...baseStyle,
        top: '25px',
        left: '50%',
        transform: 'translateX(-50%)'
      },
      left: {
        ...baseStyle,
        top: '50%',
        right: '25px',
        transform: 'translateY(-50%)'
      },
      right: {
        ...baseStyle,
        top: '50%',
        left: '25px',
        transform: 'translateY(-50%)'
      }
    };

    return positions[position];
  };

  const getArrowStyle = () => {
    const arrows = {
      top: {
        position: 'absolute' as const,
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderTop: '4px solid #374151'
      },
      bottom: {
        position: 'absolute' as const,
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: '4px solid #374151'
      },
      left: {
        position: 'absolute' as const,
        top: '50%',
        left: '100%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderLeft: '4px solid #374151'
      },
      right: {
        position: 'absolute' as const,
        top: '50%',
        right: '100%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '4px solid transparent',
        borderBottom: '4px solid transparent',
        borderRight: '4px solid #374151'
      }
    };

    return arrows[position];
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div style={getTooltipStyle()}>
          {content}
          <div style={getArrowStyle()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
