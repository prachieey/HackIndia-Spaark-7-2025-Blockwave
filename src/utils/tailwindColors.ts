// Type-safe Tailwind color utilities

type ColorVariant = 'DEFAULT' | 'light' | 'dark' | '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

type ColorName = 
  | 'primary'
  | 'space-black'
  | 'holographic-white'
  | 'deep-purple'
  | 'tech-blue'
  | 'validation-green'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

/**
 * Get a Tailwind color class with the specified variant
 * @param color - The color name from the theme
 * @param variant - The color variant (e.g., 'DEFAULT', 'light', 'dark', or a shade number)
 * @param prefix - The Tailwind utility prefix (e.g., 'bg-', 'text-', 'border-')
 * @returns A Tailwind class string
 */
export const getColorClass = (
  color: ColorName,
  variant: ColorVariant = 'DEFAULT',
  prefix: string = ''
): string => {
  // Handle numeric variants (e.g., primary-500)
  if (typeof variant === 'number' || /^\d+$/.test(variant as string)) {
    return `${prefix}${color}-${variant}`;
  }
  
  // Handle named variants (e.g., primary-light)
  if (variant !== 'DEFAULT') {
    return `${prefix}${color}-${variant}`;
  }
  
  // Default variant
  return `${prefix}${color}`;
};

/**
 * Get a background color class
 */
export const bg = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'bg-');

/**
 * Get a text color class
 */
export const text = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'text-');

/**
 * Get a border color class
 */
export const border = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'border-');

/**
 * Get a ring color class
 */
export const ring = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'ring-');

/**
 * Get a placeholder color class
 */
export const placeholder = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'placeholder-');

/**
 * Get a divide color class
 */
export const divide = (color: ColorName, variant: ColorVariant = 'DEFAULT') => 
  getColorClass(color, variant, 'divide-');

// Export color names for type safety
export const colors = {
  primary: 'primary',
  spaceBlack: 'space-black',
  holographicWhite: 'holographic-white',
  deepPurple: 'deep-purple',
  techBlue: 'tech-blue',
  validationGreen: 'validation-green',
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info'
} as const;
