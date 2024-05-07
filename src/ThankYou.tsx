import { Box, Stack, Typography } from "@mui/material";

export function ThankYou() {

  

  return (
    <Box height="100vh" width="100vw" display="flex" alignItems="center" sx={{p:1}}>
      <Stack direction='column' >
        <Typography variant="h2" mb={1}>شكراً جزيلاً</Typography>
        <Typography variant="body1">
          لكم لصبركم في وجه الطغيان ولإعطائكم إيانا فرصة الأجر بتوفير بعض حاجاتكم.
        </Typography>
      </Stack>
    </Box>
  );
}
