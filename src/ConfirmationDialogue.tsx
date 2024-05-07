import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ConfirmationDialogueProps {
  submitFunction: () => Promise<boolean>;
  text: string;
  icon: React.ReactNode;
  body: React.ReactNode;
  open: boolean;
  handleClose: () => void;
}

export function ConfirmationDialogue({
  submitFunction,
  text,
  body,
  icon,
  open,
  handleClose,
}: ConfirmationDialogueProps) {
  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>تأكيد الطلب</DialogTitle>
      <Stack flexDirection="column" pr={3} pl={3} pb={1}>
        <Box>{body}</Box>
        <Typography variant="body1" mb={2}>
          الرجاء التأكد من المعلومات المدخلة والمبلغ الإجمالي قبل البعث.
        </Typography>
        <Button
          sx={{ mt: 1 }}
          variant="contained"
          startIcon={icon}
          onClick={async () => {
            let success = false;
            for (let i = 0; i < 3; i++) {
              try {
                if ((await submitFunction()) === true) success = true;
                break;
              } catch {
                continue;
              }
            }

            if (success === true) navigate("/thank-you");
            else setError(true);
          }}
        >
          {text}
        </Button>
        {error && (
          <Alert severity="error">صار خطأ أثناء البعث. حاول مرة ثانية.</Alert>
        )}
      </Stack>
    </Dialog>
  );
}
