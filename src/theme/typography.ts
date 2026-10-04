import { fonts } from '@/theme/fonts';

// Custom font ke saath fontWeight mat use karna, weight fontFamily mein hi hai.
export const textVariants = {
  defaults: {
    fontFamily: fonts.nunito.regular,
    color: 'textPrimary',
    fontSize: 15,
    lineHeight: 20,
  },

  // ---------- Display / Headings (Raleway, Manrope) ----------
  display: {
    fontFamily: fonts.manrope.extraBold,
    fontSize: 64,
    lineHeight: 83,
  },
  hero: {
    fontFamily: fonts.raleway.bold,
    fontSize: 50,
    lineHeight: 54,
  },
  h1: {
    fontFamily: fonts.raleway.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  h3: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  h4: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    lineHeight: 23,
  },
  title: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  titleMedium: {
    fontFamily: fonts.raleway.medium,
    fontSize: 16,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.raleway.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  subtitleBold: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  overline: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    lineHeight: 15,
  },

  // ---------- Body (Nunito Sans) ----------
  lead: {
    fontFamily: fonts.nunito.light,
    fontSize: 22,
    lineHeight: 31,
  },
  bodyLight: {
    fontFamily: fonts.nunito.light,
    fontSize: 16,
    lineHeight: 25,
  },
  bodyLarge: {
    fontFamily: fonts.nunito.regular,
    fontSize: 16,
    lineHeight: 21,
  },
  body: {
    fontFamily: fonts.nunito.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  bodySemiBold: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    lineHeight: 20,
  },
  label: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 14,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    lineHeight: 18,
    color: 'textSecondary',
  },
  captionSemiBold: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    lineHeight: 18,
    color: 'textSecondary',
  },
  captionBold: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12,
    lineHeight: 18,
  },
  tiny: {
    fontFamily: fonts.nunito.regular,
    fontSize: 10,
    lineHeight: 15,
    color: 'textSecondary',
  },
  link: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    lineHeight: 20,
    color: 'textLink',
  },

  // ---------- Buttons ----------
  button: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    lineHeight: 20,
    color: 'white',
  },
  buttonSmall: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: 'white',
  },

  // ---------- Poppins (design ke jin screens mein Poppins hai) ----------
  poppinsCaption: {
    fontFamily: fonts.poppins.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  poppinsBody: {
    fontFamily: fonts.poppins.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  poppinsBodyMedium: {
    fontFamily: fonts.poppins.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  poppinsTitle: {
    fontFamily: fonts.poppins.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  poppinsHeading: {
    fontFamily: fonts.poppins.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  poppinsHeadingBold: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 25,
    lineHeight: 30,
  },
};