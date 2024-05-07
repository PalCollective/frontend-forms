import { Merchant } from "./data/merchants";

export enum GarmentType {
  UpperUnderwear = "غيار علوي",
  LowerUnderwear = "غيار سفلي",
  Top = "ترنك",
  Tshirt = "بلوزة",
  Pants = "بنطلون",
  Abaya = "عباية",
  Scarf = "حجاب",
  Socks = "جرابات",
  Slippers = "شبشب",
  Shoes = "حذاء",
  Towel = "منشفة"
}

export enum GarmentSizeType {
  Child = "أطفال",
  Teenager = "أولاد",
  Adult = "كبار",
}

export enum GarmentGender {
  Male = "رجالي",
  Female = "نسائي",
}

export enum GarmentStandardSize {
  FIXED = "مقاس واحد",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export type GarmentCategory =
  | GarmentSizeType.Child
  | [Exclude<GarmentSizeType, GarmentSizeType.Child>, GarmentGender];

export interface GarmentData {
  merchant: typeof Merchant.name;
  seller: string;
  type: GarmentType | string;
  category: GarmentCategory;
  size: GarmentStandardSize | number | '';
  package?: number;
  count: number;
  initialPrice?: number;
  price: number;
}
