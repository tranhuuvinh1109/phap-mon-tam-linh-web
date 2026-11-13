import type { Metadata } from 'next';
import { ImportantDatesCalendarView } from '@/components/calendar/important-dates-calendar-view';
import { createOpenGraphMetadata, DEFAULT_META_IMAGE } from '@/constants';

const TITLE = 'Lịch Ngày Lễ & Âm Lịch | Phật Pháp';
const DESCRIPTION =
  'Lịch ngày lễ Phật giáo, lịch âm vạn niên Việt Nam, ngày rằm mùng một, ngày vía chư Phật và Bồ Tát.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...createOpenGraphMetadata({
    title: TITLE,
    description: DESCRIPTION,
    imageUrl: DEFAULT_META_IMAGE,
  }),
};

export default function ImportantDatesPage() {
  return <ImportantDatesCalendarView />;
}

