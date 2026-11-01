import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#EBF3FF',
    100: '#D6E6FF',
    200: '#ADD0FF',
    300: '#75B0FF',
    400: '#3D8EFF',
    500: '#075BFF', // Electric Blue (Primary TAVQEN)
    600: '#064CE0',
    700: '#1747E8', // Royal Blue
    800: '#0D35B3',
    900: '#071F7A',
  },
  cyan: {
    50: '#E6FBFF',
    100: '#B8F4FF',
    200: '#85EDFF',
    300: '#47E4FF',
    400: '#1ADDFE',
    500: '#00D9FF', // Cyan Accent
    600: '#00B4D6',
    700: '#008EAB',
    800: '#006B82',
    900: '#004A5C',
  },
  purple: {
    50: '#F4EFFF',
    100: '#E5D6FF',
    200: '#CDB0FF',
    300: '#AC7EFF',
    400: '#9252FF',
    500: '#813BFF', // Purple Accent from Logo Ribbon
    600: '#6E25EA',
    700: '#5A17C6',
    800: '#46109F',
    900: '#2E066E',
  },
  silver: {
    100: '#F8FAFC',
    200: '#E8EDF5', // Metallic Silver
    300: '#CBD5E1',
    400: '#94A3B8',
  },
  navy: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#334155',
    700: '#1E293B',
    800: '#0D152B',
    850: '#0A1022',
    900: '#080D1B', // Midnight Navy
    950: '#05070D', // Deep Black
  },
  cardBg: '#080D1B',
  cardBgHover: '#0E172F',
  cardBorder: 'rgba(7, 91, 255, 0.16)',
}

const fonts = {
  heading: `'Space Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
}

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? '#05070D' : '#F8FAFC',
      color: props.colorMode === 'dark' ? '#FFFFFF' : '#05070D',
      minHeight: '100vh',
    },
    '*::placeholder': {
      color: 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: 'rgba(7, 91, 255, 0.14)',
    },
  }),
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
      transition: 'all 0.2s ease-in-out',
      _focusVisible: {
        boxShadow: '0 0 0 3px rgba(0, 217, 255, 0.4)',
      },
    },
    variants: {
      solid: (props: any) => {
        if (props.colorScheme === 'brand' || props.colorScheme === 'purple') {
          return {
            bg: 'brand.500',
            color: 'white',
            _hover: {
              bg: 'brand.600',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(7, 91, 255, 0.45)',
            },
            _active: {
              bg: 'brand.700',
              transform: 'translateY(0)',
            },
          }
        }
        if (props.colorScheme === 'cyan') {
          return {
            bg: 'cyan.500',
            color: '#05070D',
            fontWeight: '700',
            _hover: {
              bg: 'cyan.400',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0, 217, 255, 0.45)',
            },
          }
        }
        return {}
      },
      gradient: {
        bgGradient: 'linear(to-r, brand.500, cyan.500)',
        color: 'white',
        _hover: {
          bgGradient: 'linear(to-r, brand.600, cyan.400)',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
        },
      },
      outline: {
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: 'white',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'cyan.400',
        },
      },
      ghost: {
        color: 'gray.300',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.06)',
          color: 'white',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: '#0D1322',
        borderRadius: 'xl',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: '#0D1322',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'xl',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
      },
      overlay: {
        backdropFilter: 'blur(8px)',
        bg: 'rgba(0, 0, 0, 0.75)',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: '#0E1326',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            bg: '#121933',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          _focusVisible: {
            bg: '#121933',
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px #7C3AED',
          },
        },
      },
      outline: {
        field: {
          bg: '#0E1326',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
          _focusVisible: {
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px #7C3AED',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Textarea: {
    variants: {
      filled: {
        bg: '#0E1326',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'lg',
        color: 'white',
        _hover: {
          bg: '#121933',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        _focusVisible: {
          bg: '#121933',
          borderColor: 'brand.400',
          boxShadow: '0 0 0 1px #7C3AED',
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: {
        field: {
          bg: '#0E1326',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            bg: '#121933',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          color: 'gray.400',
          textTransform: 'uppercase',
          fontSize: 'xs',
          letterSpacing: 'wider',
        },
        td: {
          borderColor: 'rgba(255, 255, 255, 0.06)',
          color: 'gray.200',
        },
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        bg: '#11172A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'lg',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        p: 2,
      },
      item: {
        bg: 'transparent',
        borderRadius: 'md',
        color: 'gray.300',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.08)',
          color: 'white',
        },
        _focus: {
          bg: 'rgba(255, 255, 255, 0.08)',
          color: 'white',
        },
      },
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
})

export default theme
