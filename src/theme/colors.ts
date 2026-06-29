export const colors = {
  primary: '#2E7D32',   // Forest Green 500
  secondary: '#123214', // Forest Green 800
  tertiary: '#FF751F',  // Vivid Orange 500

  neutral: {
    50: '#FFFFFF',
    100: '#E8E8E8',  // Neutral 100 (Tertiary button default bg)
    200: '#D2D1D1',  // Neutral 200 (Tertiary button border)
    300: '#A5A4A3',  // Neutral 300 (Tertiary button pressed)
    400: '#7C7A7A',
    500: '#7B7978',
    600: '#615F5E',
    700: '#404040',
    800: '#303030',
    900: '#1F1918',  // Primary text
  },

  vividOrange: {
    50: '#FFF5EF',
    100: '#FFE3D2',
    200: '#FFCAA3',
    300: '#FFAE71',
    400: '#FF9140',
    500: '#FF751F',
    600: '#CC5E19',
    700: '#994613',
    800: '#662E0C',
    900: '#331706',
  },

  forestGreen: {
    50: '#EAF2EA',
    100: '#D5E5D6',
    200: '#ABCBAD',  // Used for disabled button state (design spec: #ABCBAD)
    300: '#82B184',  // Used for hyperlink disabled text
    400: '#508E5A',
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
    success: '#2E7D32',
    warning: '#FF751F',
  },
};

export type Colors = typeof colors;
