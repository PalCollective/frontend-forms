import { useCallback, useEffect, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { md5 } from "./utils/md5";
import { encryptText } from "./utils/crypt";
import { Link } from "react-router-dom";

export function ClothesFormLinkGenerator() {
  const [leadContact, setLeadContact] = useState<string>();
  const [endpointLink, setEndpointLink] = useState<string>();
  const [endpoint, setEndpoint] = useState<string>();

  const validateNumber = useCallback(() => 
    /^059[0-9]{7}$/.test(leadContact ?? ''), [leadContact]);
  const validateEndpoint = useCallback(() => 
    /^https:\/\/forms\.palcollective\.com\/f\/[0-9a-z]{25}$/
      .test(endpointLink ?? ''), [endpointLink]);

  useEffect(() => {
    if (validateEndpoint()) {
      const re = /^https:\/\/forms\.palcollective\.com\/f\/([0-9a-z]{25})$/;
      const match = endpointLink?.match(re);
      setEndpoint(Array.isArray(match) ? match[1] : '');
    }
  }, [endpointLink, validateEndpoint])

  const generateLinkHandler = (relative?: boolean) =>
    (relative === true ? '' : 'https://f.palcollective.com') +
    `/order-clothing/${encryptText(endpoint!, md5(leadContact!))}/${md5(leadContact!)}`;

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
          مولد الروابط
        </Typography>
        <Typography variant="body1">
          لتوفير رابط أمين لتدوين الملابس الرجاء توفير معلومتين. المعلومة الأولى
          هي رقم هاتف الشخص المحتاج في فلسطين من دون مفتاح الدولة٬ والمعلومة
          الثانية هي رابط بعث الفورم (أو رابط endpoint) من صفحة نماذج المندوب (
          <a href="https://forms.palcollective.com">هنا</a>).
        </Typography>
        <TextField
          label="رقم هاتف الشخص المحتاج"
          fullWidth
          value={leadContact}
          onChange={(event) => {
            const value = event.target.value.trim().replace(/[٠-٩]/g, (digit) =>
              "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
            setLeadContact(value.split('').map((char) => 
              char.charCodeAt(0) < '0'.charCodeAt(0) || 
              char.charCodeAt(0) > '9'.charCodeAt(0) ?
              '' : char).join(''));
          }}
          error={leadContact !== '' && !validateNumber()}
        />
        <TextField
          label="رابط endpoint للنموذج"
          fullWidth
          value={endpointLink}
          onChange={(event) => {
            setEndpointLink(event.target.value.trim());
          }}
          error={endpointLink !== '' && !validateEndpoint()}
        />
        <Button
        sx={{ mt: 1 }}
        variant="contained"
        startIcon={<ContentCopyIcon />}
        onClick={() => { 
          navigator.clipboard.writeText(generateLinkHandler());
        }}
        disabled={!endpoint || !validateNumber() || !validateEndpoint()}
      >
        نسخ الرابط للحافظة
      </Button>
      {
        validateNumber() && validateEndpoint() && endpoint &&
          <Link to={generateLinkHandler(true)} target='_blank' dir="ltr">
            <Typography variant="body2" mt={1}>{
              window.location.protocol + '//' + window.location.host
            }{generateLinkHandler(true)}</Typography>
          </Link>
      }
      </Stack>
    </Box>
  );
}
