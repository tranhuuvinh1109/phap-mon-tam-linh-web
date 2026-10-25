export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Trang chủ", iconName: "Home", href: "/" },
  { id: "practice", label: "Tu tập", iconName: "Flame", href: "#tu-tap" },
  { id: "bach-thoai-phat-phap", label: "Bạch thoại Phật pháp", iconName: "BookOpen", href: "/bach-thoai-phat-phap" },
  { id: "kinh-sach", label: "Kinh sách", iconName: "BookText", href: "/kinh-sach" },
  { id: "khai-thi", label: "Khai thị", iconName: "Sparkles", href: "/khai-thi" },
  { id: "favorites", label: "Bài viết đã lưu", iconName: "Bookmark", href: "/yeu-thich" },
  { id: "hop-phap", label: "Bạch thoại hợp pháp", iconName: "Compass", href: "#hop-phap" },
  { id: "search", label: "Tìm kiếm", iconName: "Search", href: "#tim-kiem" },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "downloads", label: "Tải xuống", iconName: "Download", href: "#tai-xuong" },
  { id: "favorites", label: "Yêu thích", iconName: "Bookmark", href: "/yeu-thich" },
  { id: "settings", label: "Cài đặt", iconName: "Settings", href: "#cai-dat" },
];

export interface QuickPracticeItem {
  id: string;
  title: string;
  subtitle: string;
  iconType: "book" | "house" | "bird" | "prayer" | "lotus";
  bgClass: string;
  borderClass: string;
  textClass: string;
  href: string;
}

export const QUICK_PRACTICE_ITEMS: QuickPracticeItem[] = [
  {
    id: "kinh",
    title: "Kinh",
    subtitle: "Nghe kinh, tụng kinh",
    iconType: "book",
    bgClass: "bg-[#FFF6E3]",
    borderClass: "border-[#FFE5B4]",
    textClass: "text-[#B46A10]",
    href: "/niem-kinh",
  },
  {
    id: "ngoi-nha-nho",
    title: "Ngôi nhà nhỏ",
    subtitle: "Học cách sống an lành",
    iconType: "house",
    bgClass: "bg-[#FFF1DE]",
    borderClass: "border-[#FFDEC0]",
    textClass: "text-[#A85816]",
    href: "/ngoi-nha-nho",
  },
  {
    id: "phong-sanh",
    title: "Phóng sanh",
    subtitle: "Giúp muôn loài, gieo duyên lành",
    iconType: "bird",
    bgClass: "bg-[#E6F7F5]",
    borderClass: "border-[#C5EFEA]",
    textClass: "text-[#168378]",
    href: "#phong-sanh",
  },
  {
    id: "phat-nguyen",
    title: "Phát Nguyện",
    subtitle: "Phát nguyện từ tâm",
    iconType: "prayer",
    bgClass: "bg-[#FDF0ED]",
    borderClass: "border-[#FADCD5]",
    textClass: "text-[#B84E38]",
    href: "#phat-nguyen",
  },
  {
    id: "thap-huong",
    title: "Thắp hương bàn thờ Phật",
    subtitle: "Thể hiện lòng thành kính",
    iconType: "lotus",
    bgClass: "bg-[#FFF6E4]",
    borderClass: "border-[#FFE5BA]",
    textClass: "text-[#B86E0E]",
    href: "#thap-huong",
  },
];

export interface PlaylistItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  href: string;
}

export const BACH_THOAI_ITEMS: PlaylistItem[] = [
  {
    id: "bt-1",
    title: "Sống an lạc trong hiện tại",
    duration: "28:16",
    thumbnail: "/images/lotus-thumb.jpg",
    href: "#",
  },
  {
    id: "bt-2",
    title: "Khởi nguồn của lòng từ bi",
    duration: "24:32",
    thumbnail: "/images/buddha-thumb.jpg",
    href: "#",
  },
  {
    id: "bt-3",
    title: "Phật pháp trong đời sống",
    duration: "31:45",
    thumbnail: "/images/auth-banner.jpg",
    href: "#",
  },
];

export const KHAI_THI_ITEMS: PlaylistItem[] = [
  {
    id: "kt-1",
    title: "Buông bỏ phiền não",
    duration: "18:20",
    thumbnail: "/images/buddha-thumb.jpg",
    href: "#",
  },
  {
    id: "kt-2",
    title: "Tu tập tại gia",
    duration: "26:48",
    thumbnail: "/images/lotus-thumb.jpg",
    href: "#",
  },
  {
    id: "kt-3",
    title: "Chánh niệm trong từng bước chân",
    duration: "22:15",
    thumbnail: "/images/auth-banner.jpg",
    href: "#",
  },
];

export interface LatestContentItem {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  href: string;
}

export const LATEST_CONTENT_ITEMS: LatestContentItem[] = [
  {
    id: "lc-1",
    title: "Kinh Kim Cang",
    category: "Kinh",
    thumbnail: "/images/lotus-thumb.jpg",
    href: "#",
  },
  {
    id: "lc-2",
    title: "Pháp thoại: Sống an lạc...",
    category: "Bạch thoại Phật pháp",
    thumbnail: "/images/buddha-thumb.jpg",
    href: "#",
  },
  {
    id: "lc-3",
    title: "Khai thị: Tâm lành...",
    category: "Khai thị",
    thumbnail: "/images/auth-banner.jpg",
    href: "#",
  },
  {
    id: "lc-4",
    title: "Bạch thoại hợp pháp...",
    category: "Bạch thoại hợp pháp",
    thumbnail: "/images/lotus-thumb.jpg",
    href: "#",
  },
];

export const CONTINUE_LISTENING_DATA = {
  title: "Kinh A Di Đà",
  subtitle: "Kinh tụng và niệm Phật",
  currentProgressPercent: 42,
  currentTime: "12:35",
  totalDuration: "32:45",
  thumbnail: "/images/lotus-thumb.jpg",
};

export const HERO_BANNER_DATA = {
  quote: "“Pháp môn tâm linh - Quảng Độ Chúng Sanh Hữu Duyên.”",
  author: "",
  bannerImage: "/images/home-hero-banner.jpg",
};
