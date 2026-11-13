import { Metadata } from 'next';
import React from 'react';
import { AdminImportantDatesView } from './components/admin-important-dates-view';

export const metadata: Metadata = {
  title: 'Quản lý ngày quan trọng | Quản trị Phật Pháp',
  description:
    'Hệ thống quản lý lịch ngày lễ Phật giáo, âm lịch vạn niên và sự kiện tâm linh.',
};

export default function AdminImportantDatesPage() {
  return (
    <main className="space-y-6">
      <AdminImportantDatesView />
    </main>
  );
}

