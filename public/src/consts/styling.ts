export const STYLES = {
  PANEL: {
    DEFAULT_WIDTH: 400,
    EXPANDED_WIDTH_PERCENT: 0.6, // 60% of viewport
  },
  COLORS: {
    BACKGROUND_DARK: 'var(--app-bg-dark)',
    ACTIVE_ICON_BLUE: 'var(--active-icon-blue)',
    INACTIVE_ICON: 'var(--inactive-icon)',

    APP_THEME: {
      SHADE_1: 'var(--app-theme-shade-1)',
      SHADE_2: 'var(--app-theme-shade-2)',
      SHADE_3: 'var(--app-theme-shade-3)',
      SHADE_4: 'var(--app-theme-shade-4)',
      SHADE_5: 'var(--app-theme-shade-5)',
      SHADE_6: 'var(--app-theme-shade-6)',
    },
  },
  FONTS: {
    HEADERS: 'Science Gothic',
    GENERAL: 'Figtree',
  },
  SPACING: {
    XXL: 64, // mantine's xl = 32
  },
  DYNAMIC_TEXT: {
    NOWRAP: {
      whiteSpace: 'nowrap' as const,
      minWidth: 0,
    },

    XL: {
      fontSize: 'clamp(28px, 4.2vw, 44px)',
      lineHeight: 1.05,
      letterSpacing: '-0.02em',
    },

    LG: {
      fontSize: 'clamp(22px, 3.2vw, 32px)',
      lineHeight: 1.1,
      letterSpacing: '-0.015em',
    },

    MD: {
      fontSize: 'clamp(14px, 1.95vw, 20px)',
      lineHeight: 1.25,
      letterSpacing: '-0.005em',
    },

    SM: {
      fontSize: 'clamp(13px, 1.7vw, 16px)',
      lineHeight: 1.25,
      letterSpacing: '0em',
    },

    XS: {
      fontSize: 'clamp(11px, 1.4vw, 13px)',
      lineHeight: 1.2,
      letterSpacing: '0.01em',
    },
  },
};
