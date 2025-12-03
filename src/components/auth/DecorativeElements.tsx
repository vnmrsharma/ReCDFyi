import React from 'react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useCanAnimateComplex } from '../../hooks/useAnimationPerformance';
import './DecorativeElements.css';

export interface DecorativeElementsProps {
  density?: 'minimal' | 'normal' | 'rich';
}

interface DecorativeElement {
  type: string;
  icon: string;
  animation: 'spin' | 'float' | 'twinkle';
}

interface ElementPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

// Decorative element configurations
const DECORATIVE_ELEMENTS: DecorativeElement[] = [
  { type: 'cd', icon: '💿', animation: 'spin' },
  { type: 'note', icon: '🎵', animation: 'float' },
  { type: 'star', icon: '⭐', animation: 'twinkle' },
  { type: 'disc', icon: '📀', animation: 'spin' }
];

// Positioning configurations for elements around the auth window
const ELEMENT_POSITIONS: ElementPosition[] = [
  { top: '10%', left: '5%' },
  { top: '15%', right: '8%' },
  { bottom: '20%', left: '10%' },
  { bottom: '15%', right: '5%' },
  { top: '40%', left: '3%' },
  { top: '50%', right: '6%' },
  { bottom: '35%', left: '7%' },
  { bottom: '40%', right: '4%' }
];

/**
 * DecorativeElements component renders period-appropriate retro icons
 * positioned around the auth window with subtle animations.
 * Automatically hides on mobile devices for performance.
 * Optimizes animation complexity based on device capabilities.
 * 
 * @param density - Controls number of decorative elements: 'minimal' (2), 'normal' (4), 'rich' (8)
 */
export function DecorativeElements({ 
  density = 'normal' 
}: DecorativeElementsProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const canAnimateComplex = useCanAnimateComplex();

  // Hide decorative elements on mobile devices
  if (isMobile) {
    return null;
  }

  // Reduce density on low-performance devices
  const effectiveDensity = !canAnimateComplex && density === 'rich' 
    ? 'normal' 
    : !canAnimateComplex && density === 'normal'
    ? 'minimal'
    : density;

  // Determine number of elements based on effective density
  const elementCount = effectiveDensity === 'minimal' ? 2 : effectiveDensity === 'normal' ? 4 : 8;

  // Select elements to display
  const elementsToDisplay = DECORATIVE_ELEMENTS.slice(0, Math.min(elementCount, DECORATIVE_ELEMENTS.length));
  
  // Repeat elements if we need more than available
  const displayElements: DecorativeElement[] = [];
  for (let i = 0; i < elementCount; i++) {
    displayElements.push(elementsToDisplay[i % elementsToDisplay.length]);
  }

  return (
    <div className="decorative-elements" aria-hidden="true">
      {displayElements.map((element, index) => {
        const position = ELEMENT_POSITIONS[index % ELEMENT_POSITIONS.length];
        const animationClass = prefersReducedMotion 
          ? 'decorative-element-static' 
          : `decorative-element-${element.animation}`;

        return (
          <div
            key={`${element.type}-${index}`}
            className={`decorative-element ${animationClass}`}
            style={position}
          >
            {element.icon}
          </div>
        );
      })}
    </div>
  );
}
