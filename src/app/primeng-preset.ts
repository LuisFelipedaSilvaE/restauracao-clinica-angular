import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const PresetClinicaRestauracao = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: 'calc(var(--radius) * 0.4)',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },
  },

  semantic: {
    primary: {
      50: 'color-mix(in oklch, var(--color-brand-primary) 8%, white)',
      100: 'color-mix(in oklch, var(--color-brand-primary) 16%, white)',
      200: 'color-mix(in oklch, var(--color-brand-primary) 32%, white)',
      300: 'color-mix(in oklch, var(--color-brand-primary) 48%, white)',
      400: 'color-mix(in oklch, var(--color-brand-primary) 68%, white)',
      500: 'var(--color-brand-primary)',
      600: 'var(--color-brand-primary-hover)',
      700: 'color-mix(in oklch, var(--color-brand-primary) 80%, black)',
      800: 'color-mix(in oklch, var(--color-brand-primary) 65%, black)',
      900: 'color-mix(in oklch, var(--color-brand-primary) 50%, black)',
      950: 'color-mix(in oklch, var(--color-brand-primary) 35%, black)',
    },

    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'var(--color-focus-ring)',
      offset: '2px',
      shadow: 'none',
    },

    colorScheme: {
      light: {
        surface: {
          0: 'var(--color-utility-white)',
          50: 'oklch(0.985 0 0)',
          100: 'oklch(0.967 0 0)',
          200: 'var(--color-border-default)',
          300: 'oklch(0.87 0 0)',
          400: 'var(--color-focus-ring)',
          500: 'var(--color-content-secondary)',
          600: 'oklch(0.439 0 0)',
          700: 'oklch(0.371 0 0)',
          800: 'oklch(0.269 0 0)',
          900: 'var(--color-content-on-secondary)',
          950: 'oklch(0.145 0 0)',
        },

        highlight: {
          background: 'var(--color-brand-primary-soft)',
          focusBackground: 'var(--color-brand-primary-subtle)',
          color: 'var(--color-brand-primary)',
          focusColor: 'var(--color-brand-primary)',
        },

        mask: {
          background: 'var(--color-overlay-backdrop)',
          color: '{surface.200}',
        },

        formField: {
          background: 'var(--color-surface-card)',
          disabledBackground: 'var(--color-surface-subtle)',
          filledBackground: 'var(--color-surface-subtle)',
          filledHoverBackground: 'var(--color-surface-subtle)',
          filledFocusBackground: 'var(--color-surface-subtle)',
          borderColor: 'var(--color-border-default)',
          hoverBorderColor: 'var(--color-focus-ring)',
          focusBorderColor: 'var(--color-brand-primary)',
          invalidBorderColor: 'var(--color-action-destructive)',
          color: 'var(--color-content-primary)',
          disabledColor: 'var(--color-content-secondary)',
          placeholderColor: 'var(--color-content-secondary)',
          invalidPlaceholderColor: 'var(--color-action-destructive)',
          floatLabelColor: 'var(--color-content-secondary)',
          floatLabelFocusColor: 'var(--color-brand-primary)',
          floatLabelActiveColor: 'var(--color-content-secondary)',
          iconColor: 'var(--color-content-secondary)',
          shadow: 'var(--shadow-card)',
        },

        text: {
          color: 'var(--color-content-primary)',
          hoverColor: 'var(--color-content-primary)',
          mutedColor: 'var(--color-content-secondary)',
          hoverMutedColor: 'var(--color-content-primary)',
        },

        content: {
          background: 'var(--color-surface-card)',
          hoverBackground: 'var(--color-surface-subtle)',
          borderColor: 'var(--color-border-default)',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },

        overlay: {
          select: {
            background: 'var(--color-surface-popover)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-content-primary)',
          },
          popover: {
            background: 'var(--color-surface-popover)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-content-primary)',
          },
          modal: {
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-border-default)',
            color: 'var(--color-content-primary)',
          },
        },

        list: {
          option: {
            focusBackground: 'var(--color-surface-subtle)',
            selectedBackground: '{highlight.background}',
            selectedFocusBackground: '{highlight.focus.background}',
            color: '{text.color}',
            focusColor: '{text.hover.color}',
            selectedColor: '{highlight.color}',
            selectedFocusColor: '{highlight.focus.color}',
            icon: {
              color: 'var(--color-content-secondary)',
              focusColor: 'var(--color-content-primary)',
            },
          },
          optionGroup: {
            background: 'transparent',
            color: 'var(--color-content-secondary)',
          },
        },

        navigation: {
          item: {
            focusBackground: 'var(--color-sidebar-accent)',
            activeBackground: 'var(--color-sidebar-accent)',
            color: 'var(--color-sidebar-content)',
            focusColor: 'var(--color-sidebar-accent-content)',
            activeColor: 'var(--color-sidebar-accent-content)',
            icon: {
              color: 'var(--color-content-secondary)',
              focusColor: 'var(--color-sidebar-accent-content)',
              activeColor: 'var(--color-sidebar-accent-content)',
            },
          },
          submenuLabel: {
            background: 'transparent',
            color: 'var(--color-content-secondary)',
          },
          submenuIcon: {
            color: 'var(--color-content-secondary)',
            focusColor: 'var(--color-sidebar-accent-content)',
            activeColor: 'var(--color-sidebar-accent-content)',
          },
        },
      },
    },
  },
});

export default PresetClinicaRestauracao;
