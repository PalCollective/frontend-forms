import { useState } from "react";
import { merchants, Merchant } from "./data/merchants";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { HTMLAttributes } from "react";

function removeKey<T extends HTMLElement>(props : HTMLAttributes<T>) {
  if ("key" in props)
    delete props.key;
  return props;
}

interface MerchantSelectionProps {
  merchant: Merchant | null;
  setMerchant: React.Dispatch<React.SetStateAction<Merchant | null>>;
  seller: string;
  setSeller: React.Dispatch<React.SetStateAction<string>>;
  validated : boolean;
  setDirtyMerchant: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MerchantSelection({
  merchant,
  setMerchant,
  seller,
  setSeller,
  validated,
  setDirtyMerchant
}: MerchantSelectionProps) {
  
  const [missingAddress, setMissingAddress] = useState<boolean>(false);
  let addressHelperText = false;
  const [missingSeller, setMissingSeller] = useState<boolean>(false);
  let sellerHelperText = false;

  function changeMerchant<T extends keyof Merchant>(key: T, value: Merchant[T]) {
    setMerchant((merchant) => { 
      if (merchant === null) throw Error('merchant modified before it is defined');
      return {...merchant, [key]: value};
    });
  }

  return (
    <>
      <Autocomplete
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        options={merchants as AutocompleteMerchantArray<typeof merchants>}
        groupBy={(option) => option?.area || "منطقة أخرى"}
        getOptionLabel={(option) => {
          if (typeof option === "string") return option;
          else if ("inputValue" in option) return option.inputValue;
          else return option.name;
        }}
        renderInput={(params) => 
          <TextField label="اسم المحل" {...params} 
          error={ validated && merchant === null } />}
        sx={{
          // '& .MuiListItemText': {
          //   marginInlineStart: "2em",
          // },
          // '& .MuiListSubheader': {
          //   lineHeight: "2em",
          //   minHeight: "auto",
          //   marginBlockEnd: "0.25em",
          // }
        }}
        renderOption={(props, option) => (
          <li            
            key={option.name}
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
            {option.name}
          </li>
        )}
        filterOptions={(options, params) => {
          const filter =
            createFilterOptions<AutocompleteMerchantValue<typeof merchants>>();
          const filtered = filter(options, params);
          const { inputValue } = params;
          if (inputValue !== "" && filtered.length === 0) {
            filtered.push({
              name: `اقترح المحل "${inputValue}"`,
              area: "منطقة أخرى",
              inputValue,
            });
          }
          return filtered;
        }}
        onChange={(_, value, reason) => {
          if (reason === "clear" || value === null) {
            setDirtyMerchant(false);
            setMerchant(null);
          } else {
            setDirtyMerchant(typeof value !== 'string' && "inputValue" in value);
            setMerchant(
              new Merchant(
                typeof value === 'string' ? value :
                  "inputValue" in value ? value.inputValue : 
                  value.name,
                typeof value === 'object' && 'contacts' in value ?
                  value.contacts ?? '' : '',
                typeof value === 'object' && 'address' in value ?
                  value.address ?? '' : '',
                typeof value === 'object' && 'area' in value ?
                  value.area ?? 'منطقة أخرى' : 'منطقة أخرى',
                typeof value === 'object' && 'categories' in value ?
                  value.categories ?? [] : [],
                )
            );
          }
        }}
      />
      {(merchant !== null) && (
        <>
          <Autocomplete
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            options={Array.isArray(merchant.contacts) ? merchant.contacts : [merchant.contacts ?? ''] }
            renderInput={(params) => (
              <TextField {...params} label="البائع" placeholder="الرجاء ادخال اسم البائع"
                InputProps={{...params.InputProps}} 
                error={ sellerHelperText = validated && !(seller?.length > 0) || missingSeller } 
                helperText={ sellerHelperText ? 'محتاجينه' : ''} />)}
            value={seller}
            onInputChange={(_, value, reason) => {
              if (reason === 'clear') {
                setSeller('');
                setMissingSeller(false);
              } else {
                setSeller(value);
                if (typeof value !== 'string' ||
                    value.trim().length === 0) {
                  setMissingSeller(true);
                } else {
                  setMissingSeller(false);
                }
                if (reason === 'input')
                  setDirtyMerchant(true);
              }
            }}
          />
          <TextField
            fullWidth
            label={'العنوان'}
            value={ merchant?.address || '' }
            placeholder={'أدخل مكان المحل'}
            onChange={(event) => {
              changeMerchant('address', event.target.value)
              if (
                typeof event.target.value !== 'string' ||
                event.target.value.trim().length === 0
              ) {
                setMissingAddress(true);
              } else {
                setMissingAddress(false);
              }
              setDirtyMerchant(true);
            }}
            variant="outlined"
            error={ addressHelperText = validated && !(merchant.address?.length > 0) || missingAddress }
            helperText={ addressHelperText ? 'كيف نجد المحل؟' : '' }
          />
        </>
      )}
    </>
  );
}

type AutocompleteValue<
  ArrayType extends readonly unknown[],
  MandatoryFields extends string
> = ArrayType extends readonly (infer ElementType)[]
  ? MandatoryFields extends keyof ElementType
    ?
        | ElementType
        | (Pick<ElementType, MandatoryFields> &
            Partial<Exclude<ElementType, MandatoryFields>> & {
              inputValue: string;
            })
    : never
  : never;
type AutocompleteArray<
  ArrayType extends readonly unknown[],
  MandatoryFields extends string
> = Array<AutocompleteValue<ArrayType, MandatoryFields>>;
type AutocompleteMandatoryMerchantFields = "name"; //| "area";
type AutocompleteMerchantArray<ArrayType extends readonly unknown[]> =
  AutocompleteArray<ArrayType, AutocompleteMandatoryMerchantFields>;
type AutocompleteMerchantValue<ArrayType extends readonly unknown[]> =
  AutocompleteValue<ArrayType, AutocompleteMandatoryMerchantFields>;
