import 'tailwindcss/tailwind.css';

declare module 'tailwindcss/tailwind-config' {
  interface Theme {
    colors: {
      primary: {
        DEFAULT: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        950: string;
      };
      'space-black': {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      'holographic-white': {
        DEFAULT: string;
        off: string;
        dark: string;
      };
      'deep-purple': {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      'tech-blue': {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      'validation-green': {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      neutral: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        950: string;
      };
      success: {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      warning: {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      error: {
        DEFAULT: string;
        light: string;
        dark: string;
      };
      info: {
        DEFAULT: string;
        light: string;
        dark: string;
      };
    };
  }
}
