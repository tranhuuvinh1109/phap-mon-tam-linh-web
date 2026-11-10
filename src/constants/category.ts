export const KHAI_THI_ID = '35d8a5b1-34d8-472b-9e5e-2d46da8fe033';
export const KHAI_THI_SLUG = 'khai-thi';
export const KHAI_THI_DEFAULT_THUMBNAIL = '/images/khai-thi-default.jpg';

export const BACH_THOAI_PHAT_PHAP_ID = 'f19d8640-92c1-4b04-9a62-a88997969619';
export const BACH_THOAI_PHAT_PHAP_SLUG = 'bach-thoai-phat-phap';
export const BACH_THOAI_DEFAULT_THUMBNAIL = '/images/bach-thoai-phat-phap.png';

export const DEFAULT_POST_THUMBNAIL = '/images/lotus-thumb.jpg';

export const NIEM_KINH_ID = 'e723dd56-cfdc-4b5a-8538-b017384f4d55';
export const NIEM_KINH_SLUG = 'niem-kinh';

export const NGOI_NHA_NHO_SLUG = 'ngoi-nha-nho';
export const NGOI_NHA_NHO_ID = '62dfaf2f-24ba-43f2-bdd3-e9ad1d6d1da0';

export const KINH_SACH_SLUG = 'kinh-sach';

export const PHONG_SINH_SLUG = 'phong-sinh';
export const PHONG_SINH_ID = '6eeab3ea-d8cc-48aa-841b-593b47a0ce77';

export const PHAT_NGUYEN_SLUG = 'phat-nguyen';

export const THAP_HUONG_BAN_THO_PHAT_SLUG = 'thap-huong-ban-tho-phat';
export const THAP_HUONG_BAN_THO_PHAT_ID = '1416d469-5932-4ad7-9703-78122ae071d7';

/**
 * Categories that allow creating posts with step-by-step content (similar to Niệm Kinh)
 * Stores category UUIDs.
 */
export const LIST_CATEGORY_IS_POST_STEP_TYPE: string[] = [
  NIEM_KINH_ID,
  NGOI_NHA_NHO_ID,
  PHONG_SINH_ID,
  THAP_HUONG_BAN_THO_PHAT_ID
];

/**
 * Default categories used across the system and admin sidebar tabs
 */
export const DEFAULT_CATEGORY_NAMES = [
  'Bạch thoại phật pháp',
  'Niệm kinh',
  'Khai thị',
  'Ngôi nhà nhỏ',
  'Kinh sách',
] as const;

export const DEFAULT_CATEGORIES = DEFAULT_CATEGORY_NAMES;

/**
 * Feature flag for Bach thoai phat phap web
 */
export const FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID = 'fd794735-a5c8-49c6-b622-8a899eb85480'

