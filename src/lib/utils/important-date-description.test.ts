import { describe, expect, it } from "vitest";
import {
  formatImportantDateDescriptionPreview,
  parseImportantDateDescription,
  serializeImportantDateDescription,
} from "./important-date-description";

describe("important-date-description", () => {
  it("returns empty fields for null, undefined, or empty string", () => {
    expect(parseImportantDateDescription(null)).toEqual({
      maxRepentancePrayers: "",
      maxLittleHouses: "",
      detailHtml: "",
    });
    expect(parseImportantDateDescription("")).toEqual({
      maxRepentancePrayers: "",
      maxLittleHouses: "",
      detailHtml: "",
    });
  });

  it("preserves backwards compatibility with legacy plain text and HTML descriptions", () => {
    expect(parseImportantDateDescription("Ngày lễ lớn trong tháng")).toEqual({
      maxRepentancePrayers: "",
      maxLittleHouses: "",
      detailHtml: "Ngày lễ lớn trong tháng",
    });

    const html = "<p><strong>Đại lễ</strong></p>";
    expect(parseImportantDateDescription(html)).toEqual({
      maxRepentancePrayers: "",
      maxLittleHouses: "",
      detailHtml: html,
    });
  });

  it("serializes and parses structured practice counts and rich detailHtml cleanly", () => {
    const serialized = serializeImportantDateDescription({
      maxRepentancePrayers: " 21 biến ",
      maxLittleHouses: " 7 tấm ",
      detailHtml: '<p>Hướng dẫn</p><img src="https://cdn.example.com/a.jpg" />',
    });

    expect(parseImportantDateDescription(serialized)).toEqual({
      maxRepentancePrayers: "21 biến",
      maxLittleHouses: "7 tấm",
      detailHtml: '<p>Hướng dẫn</p><img src="https://cdn.example.com/a.jpg" />',
    });
  });

  it("stores plain HTML directly when both count inputs are empty and strips empty Quill HTML", () => {
    expect(
      serializeImportantDateDescription({
        maxRepentancePrayers: "  ",
        maxLittleHouses: "",
        detailHtml: "<p><br></p>",
      })
    ).toBe("");

    expect(
      serializeImportantDateDescription({
        maxRepentancePrayers: "",
        maxLittleHouses: "",
        detailHtml: "<p>Chỉ có chi tiết</p>",
      })
    ).toBe("<p>Chỉ có chi tiết</p>");
  });

  it("builds a clean concatenated plain-text preview for list view", () => {
    const serialized = serializeImportantDateDescription({
      maxRepentancePrayers: "27 biến",
      maxLittleHouses: "21 tấm",
      detailHtml: "<p>Ngày <strong>quan trọng</strong> cần tinh tấn.</p>",
    });

    expect(formatImportantDateDescriptionPreview(serialized)).toBe(
      "Lễ Phật Đại Sám Hối Văn tối đa: 27 biến • Ngôi Nhà Nhỏ có thể đốt: 21 tấm • Ngày quan trọng cần tinh tấn."
    );
  });
});

