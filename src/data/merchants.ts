export class Merchant {
  name: string;
  contacts: string | string[];
  address: string;
  area: AreaInGaza;
  categories: Array<GarmentCategory>;

  constructor(
    name: string,
    contacts: string | string[],
    address: string,
    area: AreaInGaza,
    categories: Array<GarmentCategory>) {

    this.name = name;
    if (typeof contacts === 'string' || contacts instanceof String)
      this.contacts = contacts;
    else
      this.contacts = [...contacts];

    this.address = address;
    this.area = area;
    this.categories = [];
    // A deep copy of the categories
    categories.forEach((category) => {
      if (Array.isArray(category)) {
        const [gender, size] = category;
        this.categories.push([gender, size]);
      } else
        this.categories.push(category);
    });
  }
}

export type GarmentGenderCategory =
  'رجالي' |
  'نسواني';

export type GarmentSizeCategory =
  'أطفال' |
  'أولاد' |
  'كبار';

export type GarmentCategory = [
  GarmentGenderCategory, 
  Exclude<GarmentSizeCategory, 'أطفال'>
] | 'أطفال';

export type AreaInGaza =
  'رفح' |
  'دير البلح' |
  'خان يونس' |
  'منطقة أخرى';

export const merchants = [
  new Merchant(
    'معرض جبر',
    'نضال رضوان',
    'دير البلح دوار المدفع مقابل مسجد الانصار',
    'دير البلح',
    [
      ['رجالي', 'أولاد'],
      ['رجالي', 'كبار'],
    ]
  ),
  new Merchant(
    'قريزي ستور',
    ['عبد الكريم', 'حازم أبو الطواحين'],
    'دير البلح غرب دوار البركة مقابل مخبز زادنا',
    'دير البلح',
    [
      ['نسواني', 'كبار'],
    ]
  ),
  new Merchant(
    'مودل ستار',
    'براء اسماعيل',
    'ساعدونا بإدخال عنوان المحل',
    'دير البلح',
    [
      'أطفال',
    ]
  ),
  new Merchant(
    'صبايا ستايل',
    'محمود أبو حصيرة',
    'مخيم يبنا شارع الوكالة غرب كريم سنتر ب٣٠ متر',
    'رفح',
    [
      'أطفال',
    ]
  ),
];
