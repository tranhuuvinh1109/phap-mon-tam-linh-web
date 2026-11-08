"use client";

import React from "react";

import { useGetHomeBachThoaiPosts, useGetHomeKhaiThiPosts } from "@/api/post";
import { useGetSettingById } from "@/api/setting";
import {
  BachThoaiSection,
  HeroBanner,
  KhaiThiList,
  QuickPractice,
} from "@/components/home";
import { MainLayout } from "@/components/layout";
import { FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID } from "@/constants";
import {
  HERO_BANNER_DATA,
  QUICK_PRACTICE_ITEMS,
} from "@/constants/home.constants";

export function HomeView() {
  const { data: bachThoaiSetting } = useGetSettingById(
    FEATURE_FLAG_BACH_THOAI_PHAT_PHAP_WEB_ID
  );
  const isBachThoaiEnabled = bachThoaiSetting ? bachThoaiSetting.isEnabled : true;

  const { data: bachThoaiPosts, isLoading: isBachThoaiLoading } = useGetHomeBachThoaiPosts(
    { enabled: isBachThoaiEnabled }
  );

  const { data: khaiThiPostsData, isLoading: isKhaiThiLoading } = useGetHomeKhaiThiPosts();

  return (
    <MainLayout activeId="home">
      <div className="flex flex-col items-start gap-6 xl:flex-row">
        {/* Left & Center Main Stream (Hero, Audio, Categories, Recent) */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* 1. Hero Quote Banner */}
          <HeroBanner
            quote={HERO_BANNER_DATA.quote}
            author={HERO_BANNER_DATA.author}
            bannerImage={HERO_BANNER_DATA.bannerImage}
          />

          {/* 2. Quick Practice 5 Pastel Category Cards */}
          <QuickPractice items={QUICK_PRACTICE_ITEMS} />

          {/* 3. Bạch thoại phật pháp (ẩn/hiện theo setting) */}
          {isBachThoaiEnabled && (
            <BachThoaiSection
              posts={bachThoaiPosts?.data}
              isLoading={isBachThoaiLoading}
            />
          )}

          {/* 4. Khai thị */}
          <KhaiThiList
            posts={khaiThiPostsData?.data}
            isLoading={isKhaiThiLoading}
          />

          {/* 5. Latest Content 4-Grid Cards */}
          {/* <LatestContent items={LATEST_CONTENT_ITEMS} /> */}
        </div>
      </div>
    </MainLayout>
  );
}
