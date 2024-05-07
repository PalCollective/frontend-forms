import { Box, Card, Stack, Typography } from "@mui/material";
import { useRouteError } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      alignItems="center"
      sx={{ p: 1 }}
    >
      <Stack direction="column">
        <Typography variant="h2" mb={1}>
          غلطنا معكم
        </Typography>
        <Typography variant="body1" mb={2}>
          هاي مشكلة برمجية ونحنا الحق علينا فسامحونا.
        </Typography>
        <Card variant="elevation">
          <div dir="ltr">
            <Typography variant="code" sx={{ p: 1 }}>
              {JSON.stringify(error)}
            </Typography>
          </div>
        </Card>
      </Stack>
    </Box>
  );
}
