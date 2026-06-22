// MaxiLearn Design System — v1.0
// Source of truth: MaxiLearn DesignSystem.dc.html

export const colors = {
  primary: {
    50:  "#fceeee",
    100: "#f6d6d6",
    400: "#e05a52",
    600: "#CC1F1F",
    800: "#a3160f",
  },
  neutral: {
    ink:     "#16100f",
    700:     "#3a3030",
    500:     "#6a605e",
    400:     "#8a807e",
    300:     "#b3a6a6",
    200:     "#ece4e4",
    100:     "#f4eded",
    surface: "#f6f4f3",
  },
  semantic: {
    success: "#1f8a5b",
    successBg: "#e8f5ee",
    successBorder: "#cbe8d8",
    danger:  "#CC1F1F",
    dangerBg: "#fceeee",
    dangerBorder: "#f6d6d6",
    warning: "#d9821f",
    warningBg: "#fdf3e2",
    warningBorder: "#f3e1bf",
    info:    "#3a6ea5",
    infoBg:  "#e9f0f8",
    infoBorder: "#c9dcf0",
  },
  roles: {
    admin:     { color: "#CC1F1F", bg: "#fceeee", border: "#f6d6d6" },
    professor: { color: "#b9842f", bg: "#fdf3e2", border: "#f3e1bf" },
    estudante: { color: "#1f8a5b", bg: "#e8f5ee", border: "#cbe8d8" },
  },
} as const;

export const typography = {
  fontFamily: "'Manrope', system-ui, sans-serif",
  h1: { fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em" },
  h2: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" },
  h3: { fontSize: 20, fontWeight: 800 },
  h4: { fontSize: 16, fontWeight: 700 },
  body: { fontSize: 15, fontWeight: 500, lineHeight: 1.6 },
  caption: { fontSize: 13, fontWeight: 500 },
  label: { fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const },
} as const;

export const spacing = {
  radius: {
    sm:   8,
    md:   11,
    lg:   16,
    xl:   20,
    pill: 100,
  },
  input: {
    padding: "12px 14px",
    radius: 11,
  },
} as const;

export const shadows = {
  primary: "0 10px 24px rgba(204,31,31,0.28)",
  card:    "0 4px 16px rgba(60,20,20,0.06)",
  dropdown: "0 24px 56px rgba(60,20,20,0.18)",
} as const;
