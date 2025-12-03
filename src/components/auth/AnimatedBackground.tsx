import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useCanAnimateComplex } from '../../hooks/useAnimationPerformance';
import './AnimatedBackground.css';

export interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'geometric' | 'minimal';
  animated?: boolean;
}

/**
 * AnimatedBackground component provides visually rich Y2K-styled backgrounds
 * for the authentication page with support for reduced motion preferences.
 * Automatically optimizes performance based on device capabilities.
 * 
 * @param variant - Visual style: 'gradient' (animated colors), 'geometric' (patterns), or 'minimal' (static)
 * @param animated - Override for animation control (defaults to respecting user preferences)
 */
export function AnimatedBackground({ 
  variant = 'gradient',
  animated = true 
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const canAnimateComplex = useCanAnimateComplex();

  // Determine if animations should be enabled
  // Consider both user preference and device capabilities
  const shouldAnimate = animated && !prefersReducedMotion && canAnimateComplex;

  // Build CSS class names based on variant and animation state
  const classNames = [
    'animated-background',
    `animated-background-${variant}`,
    shouldAnimate ? 'animated-background-active' : 'animated-background-static'
  ].join(' ');

  return (
    <div className={classNames} aria-hidden="true">
      {variant === 'geometric' && (
        <div className="geometric-pattern">
          <div className="geometric-shape geometric-circle"></div>
          <div className="geometric-shape geometric-square"></div>
          <div className="geometric-shape geometric-triangle"></div>
        </div>
      )}
    </div>
  );
}
