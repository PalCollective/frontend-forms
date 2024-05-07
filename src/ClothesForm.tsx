import { useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  IconButton,
  ListItem,
  ListItemAvatar,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Merchant } from "./data/merchants";
import { MerchantSelection } from "./MerchantSelection";
import { ConfirmationDialogue } from "./ConfirmationDialogue";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useLoaderData } from "react-router-dom";
import { md5 } from "./utils/md5";

import { List, ListItemText } from "@mui/material";
const DEBUG = import.meta.env.MODE === "development";
const NODEBUG = true;

import { GarmentData, GarmentSizeType, GarmentStandardSize } from "./garments";
import { Garment } from "./Garment";
import { merchants } from "./data/merchants";
import { decryptText } from "./utils/crypt";

interface FormsUrlParams {
  formsId: string;
  invitationId: string;
}

// interface IpLocationInformationDeprecated {
//   country_code: string;
//   country_name: string;
//   city: string;
//   postal: string
//   latitude: number,
//   longitude: number;
//   IPv4: string;
//   state: string;
// }

interface IpLocationInformation {
  as: string;
  city: string;
  country: string;
  countryCode: string;
  isp: string;
  lat: number;
  lon: number;
  org: string;
  query: string;
  region: string;
  regionName: string;
  status: "success";
  timezone: string;
  zip: string;
}

// The form renderer component
export function ClothesForm() {
  const [validated, setValidated] = useState<boolean>(false);
  const [garments, setGarments] = useState<GarmentData[]>([]);
  const [merchantSuggestions, setMerchantSuggestions] = useState<Merchant[]>(
    []
  );
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [dirtyMerchant, setDirtyMerchant] = useState<boolean>(false);
  const [seller, setSeller] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(NaN);
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>(false);
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);

  const ipLocation = useRef<Partial<IpLocationInformation>>({});

  const validate = useCallback(
    (silent?: boolean) => {
      let isError = false;
      const values = [merchant?.name, merchant?.address, seller];
      if (values.some((value) => value?.trim().length === 0)) {
        if (silent !== true)
          setErrorMessage("من أي محل أو بائع تحجزون هذه القطعة؟");
        isError = true;
      }

      let errorPriceDiscrepancy = false;
      garments.forEach((o) => {
        const n = (n: number) =>
          isFinite(n) && parseInt(n.toString()) === n && n > 0;
        errorPriceDiscrepancy = errorPriceDiscrepancy || (
            "initialPrice" in o && 
            typeof o.initialPrice === 'number' && 
            o.initialPrice < o.price
        );
        if (
          o.type.trim() === '' ||
          o.size === "" ||
          !n(o.count) ||
          o.price <= 0.0 ||
          ("package" in o && !n(o.package!)) ||
          ("initialPrice" in o && !n(o.initialPrice!))
        ) {
          isError = true;
        }
      });

      if (errorPriceDiscrepancy)
        isError = true;

      if (isError && silent !== true)
        setErrorMessage("بعض القطع معلوماتها ناقصة أو غير صحيحة" +
        (errorPriceDiscrepancy ? ' (السعر بعد المفاصلة أعلى من السعر الأصلي)' : ''));
      if (isError) return false;

      setErrorMessage("");
      return true;
    },
    [garments, seller, merchant?.address, merchant?.name]
  );

  useEffect(() => {
    setTotalAmount(() => garments.reduce((a, b) => a + b.price * b.count, 0.0));
  }, [garments]);

  useEffect(() => {
    setReadyToSubmit(validate(true));
  }, [validate]);

  useEffect(() => {
    (async () => {
      let success = false;
      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(
            "https://pro.ip-api.com/json?key=GanD5rlZLbcf3UI"
          );
          const obj = (await res.json()) as IpLocationInformation;
          if (obj.status !== "success")
            throw Error(
              "the status field of the IP geo API returned " + obj.status
            );

          ipLocation.current = {
            countryCode: obj.countryCode,
            region: obj.region,
            city: obj.city,
            as: obj.as,
            zip: obj.zip,
          };
          success = true;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!success) console.error("failed to fetch IP information.");
      else console.info(JSON.stringify(ipLocation.current));
    })();
  }, []);

  const {
    url: { formsId, invitationId },
  } = useLoaderData() as { url: FormsUrlParams };
  const [leadContact, setLeadContact] = useState<string>("");
  const [leadVerified, setLeadVerified] = useState<boolean>(
    invitationId === "test" ? true : false
  );
  const [securityChecked, setSecurityChecked] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (
        leadVerified &&
        typeof endpoint === "string" &&
        endpoint.length >= 25
      ) {
        console.log("security check in progress...");
        const res = await fetch(
          `https://forms.palcollective.com/f/${endpoint}`,
          { method: "POST" }
        );
        if (res.status === 406) {
          setSecurityChecked(true);
          console.log(
            "security check SUCCESSFUL (authenticity of form verified)"
          );
          return;
        }
        const data: Record<string, string> = {
          ipLocation: JSON.stringify(ipLocation),
          formsId,
          invitationId,
          leadContact,
          endpoint,
        };
        const payload = [];
        for (const property in data) {
          payload.push(
            `${encodeURIComponent(property)}=${encodeURIComponent(
              data[property]
            )}`
          );
        }
        console.log("security check FAILED");
        await fetch(
          `https://forms.palcollective.com/f/clvwc6k47002timv3hmkqyoit`,
          {
            method: "POST",
            redirect: "manual",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: payload.join("&"),
          }
        );
      }
    })();
  }, [leadVerified, endpoint]);

  useEffect(() => {
    if (typeof leadContact === "string" && leadContact.length === 10) {
      const md5Hash = md5(leadContact);
      if (md5Hash === invitationId) {
        setEndpoint(decryptText(formsId, md5Hash));
        setLeadVerified(true);
      }
    }
  }, [leadContact, formsId, invitationId]);

  function changeGarment<T extends keyof GarmentData>(
    key: T,
    value: GarmentData[T],
    index?: number
  ) {
    if (index === undefined) {
      index = garments.length - 1;
    } else if (
      typeof index !== "number" ||
      index < 0 ||
      index >= garments.length
    ) {
      throw Error(`garment index (${index}) out of range`);
    }

    setGarments((garments) => [
      ...garments.slice(0, index),
      { ...garments[index], [key]: value },
      ...garments.slice(index + 1),
    ]);
  }

  const addGarmentButtonHandler = () => {
    if (!validate()) setValidated(true);
    else {
      // if we have a dirty merchant object, then we need to check
      // if the object matches one of the merchants hardcoded into
      // the app, otherwise we add it as a suggestion.
      if (dirtyMerchant) {
        let addToSuggestions = false,
          index = -1;
        if (
          0 <=
          (index = merchants.findIndex(
            (o) => merchant?.name && o.name.trim() === merchant.name.trim()
          ))
        ) {
          if (merchant?.address && merchant.address.length > 0)
            if (merchants[index].address !== merchant.address.trim())
              addToSuggestions = true;
          // type narrowing in TS did not work with array indexing
          const contacts = merchants[index].contacts;
          if (typeof contacts == "string") {
            if (contacts.trim() !== seller && seller.trim())
              addToSuggestions = true;
          } else if (!contacts.some((c) => c.trim() === seller.trim()))
            addToSuggestions = true;
        } else addToSuggestions = true;

        if (addToSuggestions)
          setMerchantSuggestions((list) => [
            ...list,
            { ...merchant } as Merchant,
          ]);
      }

      setGarments((list) => [
        ...list,
        {
          merchant: merchant?.name || "محل غير معروف",
          seller: seller,
          category: GarmentSizeType.Child,
          size: GarmentStandardSize.FIXED,
          type: "",
          count: NaN,
          price: NaN,
        },
      ]);

      setValidated(false);
    }
  };

  async function submitForm(): Promise<boolean> {
    if (!securityChecked || typeof endpoint !== 'string' || endpoint.trim().length !== 25)
      return false;

    const keyedGarments = garments.reduce((object : Record<string, string>, element, index) => {
      object[`garment${index}`] = JSON.stringify(element);
      return object;
    }, {});

    const keyedSuggestions = merchantSuggestions.reduce((object : Record<string, string>, element, index) => {
      object[`suggested${index}`] = JSON.stringify(element);
      return object;
    }, {});

    const data: Record<string, string> = {
      IP_info: JSON.stringify(ipLocation),
      confirmed_phone: leadContact,
      total_amount: totalAmount.toString(),
      ...keyedGarments,
      ...keyedSuggestions,
    };
    
    const payload = [];
    for (const property in data) {
      payload.push(
        `${encodeURIComponent(property)}=${encodeURIComponent(
          data[property]
        )}`
      );
    }

    let success = false;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(
          `https://forms.palcollective.com/f/${endpoint}`,
          {
            method: "POST",
            redirect: "follow",
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: payload.join("&"),
          }
        );
        if (res.status === 200) {
          success = true;
          break ;
        }
        console.warn(`insuccessful submission, code returned ${res.status}`);
        console.dir(res);
      } catch {
        continue ;
      }
    }

    return success;
  }

  return leadVerified !== true ? (
    <Container fixed>
      <Grid>
        <Typography variant="h2" mt={1}>
          نموذج الكسوة
        </Typography>
        <Typography variant="body1" mt={2} mb={2}>
          هذا الرابط بعث من قبل بعض مندوبينا لعائلة بعينها. وحيث إننا حذرون جدًا
          ولا نخزن أية معلومات شخصية لكم فالطريقة الوحيدة لنعرف الأشخاص الذين
          يبعثون المعلومات هنا هي عن طريق رقم الهاتف في فلسطين والمسجل عند
          العميل.
        </Typography>
        <Typography variant="body1" mt={2} mb={1}>
          لذلك نطلب منكم إدخال رقم هاتفكم في فلسطين من دون رمز الدولة لتتمكنوا
          من الوصول لهذا الطلب وبعثه:
        </Typography>
        <TextField
          label="رقم الهاتف المسجل عند العميل"
          fullWidth
          value={leadContact}
          onChange={(event) => {
            const value = event.target.value
              .trim()
              .replace(/[٠-٩]/g, (digit) =>
                "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString()
              );
            setLeadContact(
              value
                .split("")
                .map((char) =>
                  char.charCodeAt(0) < "0".charCodeAt(0) ||
                  char.charCodeAt(0) > "9".charCodeAt(0)
                    ? ""
                    : char
                )
                .join("")
            );
          }}
        />
      </Grid>
    </Container>
  ) : (
    <Container fixed>
      <ConfirmationDialogue
        open={confirmationOpen}
        handleClose={() => {
          setConfirmationOpen(false);
        }}
        text="بعث الطلب"
        icon={<CheckIcon />}
        submitFunction={submitForm}
        body={
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <CheckroomIcon />
                </Avatar>
                <ListItemText
                  primary={`تم اختيار ${garments.length} قطع`}
                  secondary={`بكلفة اجمالية من ${totalAmount} شيكل`}
                  sx={{marginInlineStart: "0", width: '100%'}}
                />
              </ListItemAvatar>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <StorefrontIcon />
                </Avatar>
                <ListItemText
                  primary={
                    merchantSuggestions.length === 0
                      ? "لا توجد أي محلات مقترحة"
                      : "تم اقتراح محلات أو تعديل معلومات محل معروف"
                  }
                  secondary={"لا نضمن الشراء من المحلات المقترحة"}
                  sx={{marginInlineStart: "0", overflowY: 'auto'}}
                />
              </ListItemAvatar>
            </ListItem>
          </List>
        }
      />
      <Grid>
        <Typography variant="h2" mt={1}>
          نموذج الكسوة
        </Typography>
        <Typography variant="body1" mt={2} mb={4}>
          الرجاء ملء هذا النموذج من محل الملابس وبعثه عند تمام عملية الحجز
          لمساعدتنا على الدفع للتاجر٬ وتذكروا أن تفاصلوا التاجر وترفضوا الأسعار
          غير المنطقية وتقتصدوا٬ فأموالنا هي كأموالكم٬ وبارك الله فيكم.
        </Typography>
        <MerchantSelection
          {...{
            merchant,
            setMerchant,
            seller,
            setSeller,
            validated,
            setDirtyMerchant,
          }}
        />
        <Typography variant="h4" mt={3} mb={2}>
          القطع المحجوزة
        </Typography>
        {garments.length == 0 ? (
          <Typography variant="body1" mb={4}>
            لا توجد أية قطع مضافة٬ أضف القطع المرغوبة عن طريق الزر أدناه.
          </Typography>
        ) : (
          garments.map((thisGarment, index) => (
            <>
              <Typography variant="h5" sx={{ fontWeight: 200 }}>
                القطعة رقم "{String.fromCharCode("٠".charCodeAt(0) + index)}"{" "}
                <IconButton
                  sx={{ display: "inline" }}
                  onClick={() => {
                    setGarments((list) => [
                      ...list.slice(0, index),
                      ...list.slice(index + 1),
                    ]);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Typography>
              <Garment
                key={index}
                validated={validated}
                garment={thisGarment}
                changeGarment={function <T extends keyof GarmentData>(
                  key: T,
                  value: GarmentData[T]
                ) {
                  changeGarment(key, value, index);
                }}
              />
              {index < garments.length - 1 && (
                <Divider orientation="horizontal" />
              )}
            </>
          ))
        )}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addGarmentButtonHandler}
        >
          إضافة قطعة
        </Button>
        {errorMessage !== "" && (
          <Alert sx={{ mt: 2 }} severity="error">
            {errorMessage}
          </Alert>
        )}
      </Grid>

      {Array.isArray(garments) &&
        garments.length > 0 &&
        isFinite(totalAmount) &&
        validated &&
        readyToSubmit && (
          <>
            <Card
              variant="elevation"
              sx={{ p: 1, mt: 6, backgroundColor: "aliceblue" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 200 }}>
                المبلغ الإجمالي ({garments.length} قطعة)
              </Typography>
              <Divider orientation="horizontal" />
              <Typography variant="h6">{totalAmount} شيكل</Typography>
            </Card>
          </>
        )}

      <Button
        sx={{ mt: 1 }}
        variant="contained"
        startIcon={<ShoppingCartIcon />}
        onClick={() => {
          if (!validated) setValidated(true);
          else {
            if (securityChecked && validate()) {
              setConfirmationOpen(true);
            }
          }
        }}
        disabled={!securityChecked}
      >
        {validated ? "توكلنا على الله" : "تحضير الطلب"}
      </Button>

      {DEBUG && !NODEBUG && (
        <Card
          variant="elevation"
          sx={{ p: 1, mt: 6, backgroundColor: "aliceblue" }}
        >
          <Typography variant="h6">معلومات إضافية للمطور</Typography>
          <Divider orientation="horizontal" />
          <Typography variant="h6" sx={{ fontWeight: 200 }}>
            معلومات المحل
          </Typography>
          <List dense={true}>
            <ListItemText primary="اسم المحل" secondary={merchant?.name} />
            <ListItemText primary="منطقة المحل" secondary={merchant?.area} />
            <ListItemText primary="عنوان المحل" secondary={merchant?.address} />
            <ListItemText
              primary="أشخاص المحل"
              secondary={JSON.stringify(merchant?.contacts)}
            />
            <ListItemText
              primary="أنواع الملابس الموجودة"
              secondary={JSON.stringify(merchant?.categories)}
            />
            <ListItemText primary="البياع" secondary={seller} />
          </List>
          <Divider orientation="horizontal" />
          <Typography variant="h6" sx={{ fontWeight: 200 }}>
            معلومات القطع
          </Typography>
          {Array.isArray(garments) &&
            garments.map((garment, index) => (
              <Box
                key={index}
                sx={{
                  m: 1,
                  backgroundColor: "rgb(255,255,255,0.75)",
                  borderRadius: 2,
                }}
              >
                <List dense={true}>
                  <ListItemText
                    primary="اسم المحل"
                    secondary={garment.merchant}
                  />
                  <ListItemText
                    primary="اسم البياع"
                    secondary={garment.seller}
                  />
                  <ListItemText primary="نوع القطعة" secondary={garment.type} />
                  <ListItemText
                    primary="حجم القطعة"
                    secondary={JSON.stringify(garment.category)}
                  />
                  <ListItemText
                    primary="مقاس القطعة"
                    secondary={garment.size}
                  />
                  <ListItemText
                    primary="تعداد القطعة (للقطع والربطة)"
                    secondary={`${garment.package}/${garment.count}`}
                  />
                  <ListItemText
                    primary="سعر القطعة (قبل وبعد المفاصلة)"
                    secondary={`${
                      garment?.initialPrice ? `${garment?.initialPrice}/` : ""
                    }${garment.price}`}
                  />
                </List>
              </Box>
            ))}
          <Divider orientation="horizontal" />
          <Typography variant="h6" sx={{ fontWeight: 200 }}>
            المحلات المقترحة
          </Typography>
          {Array.isArray(merchantSuggestions) &&
            merchantSuggestions.map((suggestion, index) => (
              <Box
                key={index}
                sx={{
                  m: 1,
                  backgroundColor: "rgb(255,255,255,0.75)",
                  borderRadius: 2,
                }}
              >
                <List dense={true}>
                  {suggestion?.name && (
                    <ListItemText primary="الاسم" secondary={suggestion.name} />
                  )}
                  <ListItemText primary="البائع" secondary={seller} />
                  {suggestion?.address && (
                    <ListItemText
                      primary="العنوان"
                      secondary={suggestion.address}
                    />
                  )}
                </List>
              </Box>
            ))}
        </Card>
      )}
    </Container>
  );
}
