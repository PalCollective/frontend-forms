import React from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@fontsource/ibm-plex-sans-arabic/200.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./index.css";

import { ClothesForm } from "./ClothesForm";
import { ThankYou } from "./ThankYou";
import { ErrorPage } from "./ErrorPage";
import { ClothesFormLinkGenerator } from "./ClothesFormLinkGenerator";

declare module '@mui/material/styles' {
  interface TypographyVariants {
    code: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
  }
}

let theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: ['"IBM Plex Sans Arabic"', "sans-serif"].join(","),
    fontSize: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        root: {
          fontFamily: ['"IBM Plex Sans Arabic"', "sans-serif"].join(","),
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        // Style all variants as bold except those marked as body
        root: ({ ownerState }) => {
          if (
            typeof ownerState.variant === "string" &&
            !ownerState.variant.startsWith("body")
          ) {
            return { fontWeight: 600 };
          } else if (ownerState.variant === "code") {
            return {
              width: '90vw',
              height: 'auto',
              fontSize: '8px',
              fontFamily: ['"Nimbus Mono PS"', '"Courier New"', 'monospace'].join(','),
              overflowY: 'scroll',
            }
          }
        },
      },
    },
    MuiListItemText: {
      defaultProps: {},
      styleOverrides: {
        root: {
          marginInlineStart: "2em",
        },
      },
    },
    MuiListSubheader: {
      defaultProps: {},
      styleOverrides: {
        root: {
          lineHeight: "2em",
          minHeight: "auto",
          marginBlockEnd: "0.25em",
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {},
      styleOverrides: {
        root: {},
      },
    },
    MuiGrid: {
      styleOverrides: {
        root: (state) =>
          state.variant === "special" && {
            marginLeft: "0.5px",
            marginBottom: "10px",
            backgroundColor: "white",
            borderRadius: "10px",
            p: 3,
            boxShadow: "2px 5px 10px rgba(0,0,0,0.3)",
          },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: "dense",
        // fullWidth: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        margin: "dense",
        // fullWidth: true,
      },
    },
    MuiButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFilledInput: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiInputBase: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiOutlinedInput: {
      defaultProps: {
        margin: "dense",
      },
    },
    MuiFab: {
      defaultProps: {
        size: "small",
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: "dense",
      },
    },
  },
});
theme.spacing(1);
theme = responsiveFontSizes(theme);

// Create rtl cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "/order-clothing/:formsId/:invitationId/",
        element: <ClothesForm />,
        loader: async ({ params }) => {
          return { url: params };
        },
      },
      {
        path: "/create-order-clothing",
        element: <ClothesFormLinkGenerator />,
      },
      {
        path: "/thank-you",
        element: <ThankYou />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <CssBaseline />
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
