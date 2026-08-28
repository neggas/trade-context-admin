import type { ComponentStyleConfig } from "@chakra-ui/theme";

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontSize: "12px",
    cursor: "pointer",
    transition: ".2s",
  },
  variants: {
    primary: {
      bg: "text",
      color: "background",
      border: "1px solid",
      borderColor: "text",
      _hover: { opacity: 0.85 },
    },
    secondary: {
      color: "secondary",
      border: "1px solid",
      borderColor: "border",
      bg: "transparent",
      _hover: { color: "text", borderColor: "borderHover" },
    },
    danger: {
      color: "loss",
      border: "1px solid",
      borderColor: "border",
      bg: "transparent",
      _hover: { borderColor: "loss" },
    },
    icon: {
      w: "29px",
      h: "29px",
      p: 0,
      color: "muted",
      border: "1px solid",
      borderColor: "border",
      bg: "transparent",
      fontSize: "11px",
      _hover: { color: "text", borderColor: "borderHover" },
    },
    iconDanger: {
      w: "29px",
      h: "29px",
      p: 0,
      color: "loss",
      border: "1px solid",
      borderColor: "border",
      bg: "transparent",
      fontSize: "11px",
      _hover: { borderColor: "loss" },
    },
  },
  sizes: {
    md: {
      minH: "34px",
      py: "0",
      px: "14px",
    },
    sm: {
      minH: "30px",
      py: "0",
      px: "12px",
      fontSize: "11px",
    },
  },
  defaultProps: {
    size: "md",
    variant: "secondary",
  },
};

export default Button;
