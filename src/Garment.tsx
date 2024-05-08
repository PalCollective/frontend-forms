import {
  GarmentData,
  GarmentType,
  GarmentGender,
  GarmentSizeType,
  GarmentStandardSize,
} from "./garments";
import {
  Container,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import React, { HTMLAttributes, useEffect } from "react";
import { useRef, useState } from "react";

function removeKey<T extends HTMLElement>(props: HTMLAttributes<T>) {
  if ("key" in props) delete props.key;
  return props;
}

interface GarmentProps {
  garment: GarmentData;
  changeGarment: <T extends keyof GarmentData>(
    key: T,
    value: GarmentData[T]
  ) => void;
  validated: boolean;
}

enum CountType {
  piece = "حبة",
  packet = "رزمة",
}

enum PriceType {
  negotiable = "فاصلت",
  fixed = "سعر ثابت",
}

export function Garment({ validated, garment, changeGarment }: GarmentProps) {
  const garmentSizeFieldDOM = useRef<HTMLElement>(null);
  const [countType, setCountType] = useState<CountType>(CountType.piece);
  const [priceType, setPriceType] = useState<PriceType>(PriceType.fixed);

  let missingType = false,
    missingSize = false,
    incorrectSize = false,
    missingPackageCount = false,
    incorrectPackageCount = false,
    missingPieceCount = false,
    incorrectPieceCount = false,
    missingInitialPrice = false,
    incorrectIntitialPrice = false,
    missingFinalPrice = false,
    incorrectFinalPrice = false;

  useEffect(() => {
    if (priceType === PriceType.fixed)
      changeGarment("initialPrice", undefined);
    else if (!("initialPrice" in garment))
      changeGarment("initialPrice", NaN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceType, changeGarment]);

  useEffect(() => {
    if (countType === CountType.piece)
      changeGarment("package", undefined);
    else if (!("package" in garment))
      changeGarment("package", NaN);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countType, changeGarment]);

  function handleNumericalInput(
    event : React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>, 
    key: keyof GarmentData, integer?: boolean) {

    let value = (event.target as HTMLInputElement).value;
    if (typeof value === 'string') {
      const re = /[٠-٩]/g;
      if (re.test(value)) {
        value = value.replace(re, (digit) =>
          "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString());
      }
      let parsedValue = NaN;
      if (integer === true)
        parsedValue = parseInt(value);
      else
        parsedValue = parseFloat(value);

      if (isFinite(parsedValue))
        changeGarment(key, parsedValue);
    }
  }

  return (
    <Container disableGutters sx={{ mb: 1 }}>
      <Container sx={{ pt: 0.5 }}>
        <ToggleButtonGroup
          color="primary"
          exclusive
          sx={{ height: "1.25em", m: "0.25em" }}
          value={
            Array.isArray(garment.category)
              ? garment.category[0]
              : garment.category ?? ""
          }
          onChange={(_, value: GarmentSizeType) => {
            if (value === GarmentSizeType.Child)
              changeGarment("category", GarmentSizeType.Child);
            else {
              if (
                Array.isArray(garment) &&
                garment.length >= 2 &&
                Object.values(GarmentGender).some(
                  (v) => garment.category[1] === v
                )
              )
                changeGarment("category", [
                  value,
                  garment.category[1] as GarmentGender,
                ]);
              else changeGarment("category", [value, GarmentGender.Male]);
            }
          }}
        >
          {Object.values(GarmentSizeType).map((size) => (
            <ToggleButton
              key={size}
              sx={{ pt: 0.5, pb: 0.5, pr: 1, pl: 1 }}
              value={size}
            >
              {size}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {garment.category !== GarmentSizeType.Child && (
          <ToggleButtonGroup
            color="primary"
            value={garment.category[1]}
            onChange={(_, value) => {
              changeGarment("category", [
                garment.category[0] as Exclude<
                  GarmentSizeType,
                  GarmentSizeType.Child
                >,
                value as GarmentGender,
              ]);
            }}
            exclusive
            sx={{ height: "1.25em", m: "0.25em" }}
          >
            {Object.values(GarmentGender).map((size) => (
              <ToggleButton
                key={size}
                sx={{ pt: 0.5, pb: 0.5, pr: 1, pl: 1 }}
                value={size}
              >
                {size}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Container>
      <Box sx={{ mt: 0.5 }}>
        <Autocomplete
          freeSolo
          clearOnBlur
          handleHomeEndKeys
          sx={{ display: "inline-block", width: "12ch", marginInlineEnd: 0.25 }}
          options={Object.values<string>(GarmentType)}
          renderInput={(params) => (
            <TextField
              label="نوع القطعة"
              {...params}
              fullWidth
              error={(missingType = validated && !(garment?.type?.length > 0))}
              helperText={missingType && "محتاجينه"}
            />
          )}
          renderOption={(props, option) => (
            <li
              key={option}
              {...removeKey(props)}
              style={{
                lineHeight: "1.75em",
                minHeight: "auto",
                marginBottom: "0.125em",
                paddingBlockStart: "0.25em",
                paddingBlockEnd: "0.25em",
                paddingInlineStart: "2em",
              }}
            >
              {option}
            </li>
          )}
          value={garment?.type || ""}
          onChange={(_, value, reason) => {
            if (reason === "clear" || !value) changeGarment("type", "");
            else changeGarment("type", value);
          }}
        />
        <Autocomplete
          ref={garmentSizeFieldDOM}
          freeSolo
          clearOnBlur
          handleHomeEndKeys
          sx={{
            minWidth: "8ch",
            width: "30%",
            display: "inline-block",
            marginInlineEnd: 0.25,
          }}
          options={Object.values<GarmentStandardSize | string>(
            GarmentStandardSize
          )}
          renderInput={(params) => (
            <TextField
              label="مقاس القطعة"
              {...params}
              error={
                (missingSize = validated && garment.size === "") ||
                (incorrectSize =
                  validated && parseFloat(garment.size.toString()) <= 0.0)
              }
              helperText={
                (missingSize && "محتاجينه") ||
                (incorrectSize && "مقاس مش منطقي")
              }
            />
          )}
          renderOption={(props, option) => (
            <li
              key={option}
              {...removeKey(props)}
              style={{
                lineHeight: "1.75em",
                minHeight: "auto",
                marginBottom: "0.125em",
                paddingBlockStart: "0.25em",
                paddingBlockEnd: "0.25em",
                paddingInlineStart: "2em",
              }}
            >
              {option}
            </li>
          )}
          value={
            "size" in garment
              ? garment.size.toString()
              : GarmentStandardSize.FIXED
          }
          onInputChange={(_, value) => {
            if (typeof value === "string") {
              if (value.trim() === "") changeGarment("size", "");
              else if (
                Object.values(GarmentStandardSize).some((s) => s === value)
              )
                changeGarment("size", value as GarmentStandardSize);
              else {
                value = value.replace(/[٠-٩]/g, (digit) =>
                  "٠١٢٣٤٥٦٧٨٩".indexOf(digit).toString()
                );
                if (isNaN(parseFloat(value)))
                  changeGarment("size", GarmentStandardSize.FIXED);
                else
                  changeGarment(
                    "size",
                    parseFloat(parseFloat(value).toFixed(1))
                  );
              }
            }
          }}
        />
        <ToggleButtonGroup
          orientation="vertical"
          color="primary"
          exclusive
          value={countType}
          onChange={(_, value) => {
            setCountType(value);
          }}
          sx={{ position: "relative", top: 7.5, marginInlineEnd: 0.25 }}
        >
          {Object.values(CountType).map((type) => (
            <ToggleButton
              key={type}
              value={type}
              sx={{ pt: 0.25, pb: 0.25, pr: 1, pl: 1 }}
            >
              {type}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {countType === CountType.packet && (
          <TextField
            label="كم حبة؟"
            type="number"
            lang="en-US"
            inputProps={{
              type: "number",
              lang: "en",
              min: 1,
              step: 1,
              inputMode: "numeric",
            }}
            sx={{ width: "8ch", marginInlineEnd: 0.25 }}
            value={isFinite(garment?.package || NaN) ? garment.package : ""}
            onChange={(event) => {
              handleNumericalInput(event, 'package', true);  
            }}
            error={
              (missingPackageCount =
                validated &&
                (typeof garment.package !== "number" ||
                  !isFinite(garment.package))) ||
              (incorrectPackageCount =
                validated &&
                typeof garment.package === "number" &&
                garment.package <= 0)
            }
            helperText={
              (missingPackageCount && "محتاجينه") ||
              (incorrectPackageCount && "مش منطقي")
            }
          />
        )}
        <TextField
          label={countType === CountType.piece ? "كم حبة؟" : "كم رزمة؟"}
          type="number"
          lang="en"
          inputProps={{
            type: "number",
            lang: "en-US",
            min: 1,
            step: 1,
            inputMode: "numeric",
          }}
          sx={{ width: "8ch", marginInlineEnd: 0.25 }}
          value={isFinite(garment?.count) ? garment.count : ""}
          onChange={(event) => {
            handleNumericalInput(event, 'count', true);  
          }}
          error={
            (missingPieceCount =
              validated &&
              (typeof garment.count !== "number" ||
                !isFinite(garment.count))) ||
            (incorrectPieceCount = validated && garment.count <= 0)
          }
          helperText={
            (missingPieceCount && "محتاجينه") ||
            (incorrectPieceCount && "مش منطقي")
          }
        />
      </Box>
      <Box sx={{ mt: 1 }}>
        <ToggleButtonGroup
          orientation="vertical"
          color="primary"
          exclusive
          value={priceType}
          onChange={(_, value) => {
            setPriceType(value);
          }}
          sx={{ position: "relative", top: 7.5, marginInlineEnd: 0.25 }}
        >
          {Object.values(PriceType).map((type) => (
            <ToggleButton
              key={type}
              value={type}
              sx={{ pt: 0.25, pb: 0.25, pr: 1, pl: 1 }}
            >
              {type}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {priceType === PriceType.negotiable && (
          <TextField
            label="السعر الأصلي"
            type="number"
            lang="en-US"
            inputProps={{
              type: "number",
              lang: "en",
              min: 0,
              inputMode: "numeric",
            }}
            sx={{ minWidth: "10ch", width: "33%", marginInlineEnd: 0.25 }}
            value={
              isFinite(garment?.initialPrice || NaN) ? garment.initialPrice : ""
            }
            InputProps={{
              endAdornment: (
                <sub style={{ position: "relative", top: 12, right: 8 }}>
                  شيكل
                </sub>
              ),
            }}
            onChange={(event) => {
              handleNumericalInput(event, 'initialPrice', true);  
            }}
            error={
              (missingInitialPrice =
                validated &&
                (typeof garment.initialPrice !== "number" ||
                  !isFinite(garment.initialPrice))) ||
              (incorrectIntitialPrice =
                validated &&
                typeof garment.initialPrice === "number" &&
                garment.initialPrice <= 0)
            }
            helperText={
              (missingInitialPrice && "محتاجينه") ||
              (incorrectIntitialPrice && "هادا مش سعر")
            }
          />
        )}
        <TextField
          label="السعر النهائي"
          type="number"
          lang="en-US"
          inputProps={{
            type: "number",
            lang: "en",
            min: 0,
            inputMode: "numeric",
          }}
          sx={{ minWidth: "10ch", width: "33%" }}
          value={isFinite(garment?.price || NaN) ? garment.price : ""}
          InputProps={{
            endAdornment: (
              <sub style={{ position: "relative", top: 12, right: 8 }}>
                شيكل
              </sub>
            ),
          }}
          onChange={(event) => {
            handleNumericalInput(event, 'price', true);  
          }}
          error={
            (missingFinalPrice =
              validated &&
              (typeof garment.price !== "number" ||
                !isFinite(garment.price))) ||
            (incorrectFinalPrice =
              validated &&
              typeof garment.price === "number" &&
              garment.price <= 0)
          }
          helperText={
            (missingFinalPrice && "محتاجينه") ||
            (incorrectFinalPrice && "هادا مش سعر")
          }
        />
      </Box>
    </Container>
  );
}
