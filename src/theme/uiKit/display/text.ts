import type { ComponentStyleConfig } from "@chakra-ui/theme";

const Text: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 400,
  },
  variants: {
    pageLabel: {
      color: "accent",
      fontSize: "10px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    },
    pageTitle: {
      fontSize: "32px",
      fontWeight: 550,
      letterSpacing: "-0.035em",
    },
    pageDescription: {
      maxW: "550px",
      mt: "10px",
      color: "muted",
      fontSize: "13px",
      lineHeight: "1.7",
    },
    breadcrumb: {
      color: "muted",
      fontSize: "12px",
    },
    breadcrumbActive: {
      color: "text",
      fontWeight: 500,
      fontSize: "12px",
    },
    sidebarLabel: {
      color: "muted",
      fontSize: "9px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
    },
    sidebarLink: {
      color: "secondary",
      fontSize: "13px",
      transition: "color .2s",
    },
    sidebarLinkActive: {
      color: "text",
      fontSize: "13px",
    },
    statLabel: {
      color: "muted",
      fontSize: "9px",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    statValue: {
      mt: "18px",
      fontSize: "28px",
      fontWeight: 500,
      letterSpacing: "-0.035em",
    },
    statChange: {
      mt: "9px",
      color: "profit",
      fontSize: "10px",
    },
    tableHeader: {
      color: "muted",
      fontSize: "9px",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    tableCell: {
      fontSize: "12px",
    },
    fieldLabel: {
      color: "secondary",
      fontSize: "11px",
    },
    sectionNumber: {
      color: "muted",
      fontSize: "10px",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    profileName: {
      fontSize: "12px",
    },
    profileRole: {
      mt: "2px",
      color: "muted",
      fontSize: "10px",
    },
    logo: {
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: "0.12em",
    },
  },
  defaultProps: {
    variant: "",
    size: "",
  },
};

export default Text;
