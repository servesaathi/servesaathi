export const colors = {
  primary: '#2E7D32',   // Forest Green 500
  secondary: '#123214', // Forest Green 800
  tertiary: '#FF751F',  // Vivid Orange 500

  neutral: {
    50: '#FFFFFF',
    100: '#E8E8E8',  // Neutral 100 (Tertiary button default bg)
    200: '#D2D1D1',  // Neutral 200 (Tertiary button border)
    300: '#A5A4A3',  // Neutral 300 (Tertiary button pressed)
    400: '#8E8D8B',
    500: '#787674',
    600: '#615F5D',
    700: '#4B4946',
    800: '#34322F',
    900: '#1E1B18',  // Primary text
  },

  vividOrange: {
    50: '#FFF5EF',
    100: '#FFE3D2',
    200: '#FFC8A5',
    300: '#FFAC79',
    400: '#FF914C',
    500: '#FF751F',
    600: '#CC5E19',
    700: '#994613',
    800: '#662F0C',
    900: '#331706',
  },

  forestGreen: {
    50: '#EAF2EA',
    100: '#D5E5D6',
    200: '#ABCBAD',  // Used for disabled button state (design spec: #ABCBAD)
    300: '#82B184',  // Used for hyperlink disabled text
    400: '#58975B',
    500: '#2E7D32',  // Primary default
    600: '#256428',  // Primary pressed
    700: '#1C4B1E',  // Secondary / Hyperlink pressed
    800: '#123214',  // Secondary default
    900: '#09190A',  // Secondary pressed
  },

  background: {
    layout: '#EAF2EA',  // Bg-Background (Forest Green 50)
    base: '#FFFFFF',    // Bg-Base
    orange: '#FFF5EF',  // Bg-Orange Base
  },

  border: {
    default: '#ECEAEA',
    green: '#ABCBAD',   // G Line (Forest Green 200)
  },

  status: {
    error: '#DC2626',
    errorBg: '#FEF2F2',  // red-input (Destructive default bg)
    errorBorder: '#FEE2E2', // red-bg (Destructive default border)
    errorTextDefault: '#991B1B', // red-text*icon (Destructive default text/icon)
    errorTextDisabled: '#F87171', // red-flagged (Destructive disabled text/icon)
    success: '#2E7D32',
    warning: '#FF751F',
  },
};

export type Colors = typeof colors;
