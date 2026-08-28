import { extendTheme } from "@chakra-ui/react";

import styles from "theme/styles";
import typography from "theme/foundations/typography";
import colors from "theme/foundations/colors";
import Text from "theme/uiKit/display/text";
import Button from "theme/uiKit/inputs/button";

const overrides = {
  styles,
  typography,
  colors,
  components: {
    Text,
    Button,
    Input: {
      baseStyle: {
        field: {
          bg: "surface",
          border: "1px solid",
          borderColor: "border",
          color: "text",
          fontSize: "13px",
          px: "13px",
          py: "12px",
          _focus: { borderColor: "#414852" },
          _placeholder: { color: "muted" },
        },
      },
    },
    Textarea: {
      baseStyle: {
        bg: "surface",
        border: "1px solid",
        borderColor: "border",
        color: "text",
        fontSize: "13px",
        px: "13px",
        py: "12px",
        minH: "150px",
        _focus: { borderColor: "#414852" },
        _placeholder: { color: "muted" },
      },
    },
    Select: {
      baseStyle: {
        field: {
          bg: "surface",
          border: "1px solid",
          borderColor: "border",
          color: "text",
          fontSize: "13px",
          px: "13px",
          py: "12px",
        },
      },
    },
  },
};

const Theme = extendTheme(overrides);

export default Theme;
