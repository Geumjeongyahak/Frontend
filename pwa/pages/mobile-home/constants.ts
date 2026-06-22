import { colors, radii, spacing, typography } from "@/styles/tokens";
import type { MobileHomeDay } from "@/pwa/pages/mobile-home/types";

export const MOBILE_HOME_DAYS: MobileHomeDay[] = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
  { value: 0, label: "일" },
];

export const MOBILE_HOME_PAGE_MAX_WIDTH = "30rem";
export const MOBILE_HOME_INLINE_SPACE = "5%";
export const MOBILE_HOME_SURFACE = "#F1F1F1";
export const MOBILE_HOME_CARD_SHADOW = "0 0.25rem 1rem rgba(87, 87, 87, 0.08)";
export const MOBILE_HOME_GRADIENT = "linear-gradient(135deg, #87C25C 0%, #5FC077 100%)";
export const MOBILE_HOME_MUTED = "#7A7A7A";
export const MOBILE_HOME_TEXT_STRONG = "#121212";
export const MOBILE_HOME_DARK = "#313131";
export const MOBILE_HOME_DAY_SIZE = "10vw";
export const MOBILE_HOME_SLIDER_THRESHOLD = 0.82;
export const MOBILE_HOME_SLIDER_KNOB_SIZE = "12vw";
export const MOBILE_HOME_STATUS_CARD_MIN_HEIGHT = "30lvh";
export const MOBILE_HOME_SCHEDULE_CARD_MIN_HEIGHT = "42lvh";
export const MOBILE_HOME_ICON_BUTTON_SIZE = "10vw";
export const MOBILE_HOME_CARD_RADIUS = "7vw";
export const MOBILE_HOME_TITLE_FONT = "clamp(1.375rem, 6vw, 2rem)";
export const MOBILE_HOME_SECTION_TITLE_FONT = typography.fontSize20;
export const MOBILE_HOME_BODY_FONT = typography.fontSize16;

export const mobileHomeCardStyle = {
  background: colors.white,
  borderRadius: MOBILE_HOME_CARD_RADIUS,
  boxShadow: MOBILE_HOME_CARD_SHADOW,
};

export const mobileHomeTone = {
  background: MOBILE_HOME_SURFACE,
  text: colors.text,
  strong: MOBILE_HOME_TEXT_STRONG,
  muted: MOBILE_HOME_MUTED,
  point: colors.point,
  dark: MOBILE_HOME_DARK,
  white: colors.white,
  successGradient: MOBILE_HOME_GRADIENT,
  radius: radii.radius999,
  spacing,
  typography,
};
