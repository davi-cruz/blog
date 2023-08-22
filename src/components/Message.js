import * as React from "react";
import { Alert } from "@mui/material";

const Message = ({ severity, children }) => {
  // Test if severity is null or empty
  if (!severity) {
    severity = "info";
  }
  return (
    <Alert severity={severity} sx={{ my: 2 }}>
      {children}
    </Alert>
  );
};

export default Message;
