import lightTheme, { Theme } from '@/theme/lightTheme';
import { palette } from '@/theme/palette';
import { darkColors } from '@/theme/colors';

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...palette,
    ...darkColors,
  },
};

export default darkTheme;