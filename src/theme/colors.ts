import { palette } from '@/theme/palette';

export const lightColors = {
  mainBackground: palette.white,
  cardBackground: palette.gray_F8F8F8,
  surface: palette.blue_F8FAFF,

  primary: palette.blue_004BFF,
  primaryDark: palette.blue_003BE3,
  primaryLight: palette.blue_D9E4FF,
  primarySoft: palette.blue_F1F4FE,

  textPrimary: palette.gray_181C1F,
  textSecondary: palette.gray_707070,
  textTertiary: palette.gray_8D8D8D,
  textInverse: palette.white,
  textLink: palette.blue_004BFF,

  border: palette.gray_E9E9E9,
  divider: palette.gray_EBEBEB,
  disabled: palette.gray_C4C4C4,
  disabledBackground: palette.gray_F3F3F3,

  danger: palette.red_F63C3C,
  dangerLight: palette.red_FFEBEB,
  success: palette.green_17BE5A,
  warning: palette.yellow_F1B11C,
  rating: palette.yellow_F3BC15,
};

// Same keys hone zaroori hain, warna TypeScript error dega
export const darkColors: typeof lightColors = {
  mainBackground: palette.gray_0E0E0E,
  cardBackground: palette.gray_1F1F1F,
  surface: palette.gray_141414,

  primary: palette.blue_3873FF,
  primaryDark: palette.blue_004BFF,
  primaryLight: palette.navy_222357,
  primarySoft: palette.navy_1A3168,

  textPrimary: palette.white,
  textSecondary: palette.gray_A5A5A5,
  textTertiary: palette.gray_898A8D,
  textInverse: palette.gray_181C1F,
  textLink: palette.blue_85A8FB,

  border: palette.gray_2A2A2A,
  divider: palette.gray_202020,
  disabled: palette.gray_50555C,
  disabledBackground: palette.gray_1B1B1B,

  danger: palette.red_EC4E4E,
  dangerLight: palette.red_942727,
  success: palette.green_17BE5A,
  warning: palette.yellow_F1B11C,
  rating: palette.yellow_F3BC15,
};