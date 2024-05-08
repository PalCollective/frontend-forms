import { Container, Stack, Typography } from "@mui/material";

export function ThankYou() {
  return (
    <Container fixed>
      <Stack
        direction={"column"}
        sx={{ height: "100vh", justifyContent: "center" }}
      >
        <div style={{textAlign:'center'}}>
          <img
            src="/logo.svg"
            style={{width:"40%",marginBlockEnd:10}}
          />
        </div>
        <Typography variant="h2" mb={1}>
          شكراً جزيلاً
        </Typography>
        <Typography variant="body1">
          لكم لصبركم في وجه الطغيان ولإعطائكم إيانا فرصة الأجر بتوفير بعض
          حاجاتكم.
        </Typography>
      </Stack>
    </Container>
  );
}
