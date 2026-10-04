import { createTheme } from '@shopify/restyle';
import { palette } from '@/theme/palette';
import { lightColors } from '@/theme/colors';
import { spacing, borderRadii, breakpoints } from '@/theme/tokens';
import { textVariants } from '@/theme/typography';

const lightTheme = createTheme({
  colors: {
    ...palette,
    ...lightColors,
  },
  spacing,
  borderRadii,
  breakpoints,
  textVariants,
});

export type Theme = typeof lightTheme;
export default lightTheme;