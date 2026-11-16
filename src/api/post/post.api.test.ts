import { describe, expect, it, vi } from "vitest";
import { DEFAULT_NIEM_KINH_POST_ID } from "@/constants";
import { getPostById } from "./post.api";
import { apiClient } from "@/lib/axios";

vi.mock("@/lib/axios", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Post API - getPostById & Niem Kinh defaults", () => {
  it("should have correct DEFAULT_NIEM_KINH_POST_ID", () => {
    expect(DEFAULT_NIEM_KINH_POST_ID).toBe(
      "af1b1452-14d3-4326-b2a5-5533c6cc0c2a"
    );
  });

  it("should fetch post by ID via GET /posts/:id and unwrap response data", async () => {
    const mockPost = {
      id: "af1b1452-14d3-4326-b2a5-5533c6cc0c2a",
      title: "CÁC BƯỚC NIỆM KINH BÀI TẬP HẰNG NGÀY CHO NGƯỜI MỚI BẮT ĐẦU",
      slug: "niem-kinh-test",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockPost },
    });

    const result = await getPostById("af1b1452-14d3-4326-b2a5-5533c6cc0c2a");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/posts/af1b1452-14d3-4326-b2a5-5533c6cc0c2a"
    );
    expect(result).toEqual(mockPost);
  });

  it("should handle response directly without wrapped data property", async () => {
    const mockPost = {
      id: "af1b1452-14d3-4326-b2a5-5533c6cc0c2a",
      title: "CÁC BƯỚC NIỆM KINH BÀI TẬP HẰNG NGÀY CHO NGƯỜI MỚI BẮT ĐẦU",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockPost,
    });

    const result = await getPostById("af1b1452-14d3-4326-b2a5-5533c6cc0c2a");
    expect(result).toEqual(mockPost);
  });
});
