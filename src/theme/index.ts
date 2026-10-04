import { createBox, createText, ThemeProvider, useTheme } from '@shopify/restyle';
import lightTheme, { Theme } from '@/theme/lightTheme';
import darkTheme from '@/theme/darkTheme';

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export { lightTheme, darkTheme, ThemeProvider, useTheme };
export type { Theme };  