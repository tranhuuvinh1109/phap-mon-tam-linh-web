import { describe, expect, it } from "vitest";
import {
  BACH_THOAI_PHAT_PHAP_ID,
  BACH_THOAI_PHAT_PHAP_SLUG,
  KHAI_THI_ID,
  KHAI_THI_SLUG,
  NIEM_KINH_ID,
  NIEM_KINH_SLUG,
  NGOI_NHA_NHO_ID,
  PHONG_SINH_ID,
  THAP_HUONG_BAN_THO_PHAT_ID,
} from "@/constants";
import type { CategoryItemType } from "@/api/category/category.type";
import {
  buildCategoryQueryParams,
  isUuid,
  resolveToCategoryId,
} from "./category-resolver";

describe("category-resolver utils", () => {
  describe("isUuid", () => {
    it("should return true for valid UUIDs", () => {
      expect(isUuid("f19d8640-92c1-4b04-9a62-a88997969619")).toBe(true);
      expect(isUuid(BACH_THOAI_PHAT_PHAP_ID)).toBe(true);
      expect(isUuid("35D8A5B1-34D8-472B-9E5E-2D46DA8FE033")).toBe(true);
    });

    it("should return false for slugs, non-UUIDs or empty values", () => {
      expect(isUuid("bach-thoai-phat-phap")).toBe(false);
      expect(isUuid("khai-thi")).toBe(false);
      expect(isUuid("")).toBe(false);
      expect(isUuid(undefined)).toBe(false);
      expect(isUuid("12345")).toBe(false);
    });
  });

  describe("resolveToCategoryId", () => {
    it("should resolve 'bach-thoai-phat-phap' to BACH_THOAI_PHAT_PHAP_ID", () => {
      expect(resolveToCategoryId("bach-thoai-phat-phap")).toBe(
        BACH_THOAI_PHAT_PHAP_ID
      );
      expect(resolveToCategoryId(BACH_THOAI_PHAT_PHAP_SLUG)).toBe(
        BACH_THOAI_PHAT_PHAP_ID
      );
      expect(resolveToCategoryId(" BACH-THOAI-PHAT-PHAP ")).toBe(
        BACH_THOAI_PHAT_PHAP_ID
      );
    });

    it("should return valid UUIDs as-is", () => {
      expect(resolveToCategoryId(BACH_THOAI_PHAT_PHAP_ID)).toBe(
        BACH_THOAI_PHAT_PHAP_ID
      );
      const customUuid = "9c2a38b1-1234-4567-8901-abcdef123456";
      expect(resolveToCategoryId(customUuid)).toBe(customUuid);
    });

    it("should resolve other known slug constants", () => {
      expect(resolveToCategoryId("khai-thi")).toBe(KHAI_THI_ID);
      expect(resolveToCategoryId(KHAI_THI_SLUG)).toBe(KHAI_THI_ID);
      expect(resolveToCategoryId("niem-kinh")).toBe(NIEM_KINH_ID);
      expect(resolveToCategoryId(NIEM_KINH_SLUG)).toBe(NIEM_KINH_ID);
      expect(resolveToCategoryId("ngoi-nha-nho")).toBe(NGOI_NHA_NHO_ID);
      expect(resolveToCategoryId("phong-sinh")).toBe(PHONG_SINH_ID);
      expect(resolveToCategoryId("thap-huong-ban-tho-phat")).toBe(
        THAP_HUONG_BAN_THO_PHAT_ID
      );
    });

    it("should resolve dynamic categories from categories array by id, slug or name", () => {
      const mockCategories = [
        {
          id: "custom-cat-id-1111-2222-3333-444455556666",
          name: "Chuyên đề đặc biệt",
          slug: "chuyen-de-dac-biet",
        },
      ] as unknown as CategoryItemType[];

      expect(
        resolveToCategoryId("chuyen-de-dac-biet", mockCategories)
      ).toBe("custom-cat-id-1111-2222-3333-444455556666");

      expect(
        resolveToCategoryId("Chuyên đề đặc biệt", mockCategories)
      ).toBe("custom-cat-id-1111-2222-3333-444455556666");
    });

    it("should return undefined for unknown slugs without match", () => {
      expect(resolveToCategoryId("unknown-category")).toBeUndefined();
      expect(resolveToCategoryId("")).toBeUndefined();
      expect(resolveToCategoryId(undefined)).toBeUndefined();
    });
  });

  describe("buildCategoryQueryParams", () => {
    it("should prioritize categoryId for bach-thoai-phat-phap", () => {
      const params = buildCategoryQueryParams("bach-thoai-phat-phap");
      expect(params).toEqual({
        categoryId: BACH_THOAI_PHAT_PHAP_ID,
        category: undefined,
      });
    });

    it("should return categoryId for UUID inputs", () => {
      const params = buildCategoryQueryParams(BACH_THOAI_PHAT_PHAP_ID);
      expect(params).toEqual({
        categoryId: BACH_THOAI_PHAT_PHAP_ID,
        category: undefined,
      });
    });

    it("should fallback to category slug when no ID can be resolved", () => {
      const params = buildCategoryQueryParams("chua-co-trong-db");
      expect(params).toEqual({
        categoryId: undefined,
        category: "chua-co-trong-db",
      });
    });

    it("should return empty object when input is empty or undefined", () => {
      expect(buildCategoryQueryParams(undefined)).toEqual({});
      expect(buildCategoryQueryParams("")).toEqual({});
    });
  });
});
