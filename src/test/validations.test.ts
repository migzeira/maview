import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  usernameSchema,
  emailSchema,
  bioSchema,
  displayNameSchema,
  linkSchema,
  productSchema,
  validateImageFile,
  validateVideoFile,
  getPasswordStrength,
} from "@/lib/validations";

describe("passwordSchema", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("Ab1").success).toBe(false);
  });

  it("rejects passwords without uppercase", () => {
    expect(passwordSchema.safeParse("abcdefg1").success).toBe(false);
  });

  it("rejects passwords without lowercase", () => {
    expect(passwordSchema.safeParse("ABCDEFG1").success).toBe(false);
  });

  it("rejects passwords without numbers", () => {
    expect(passwordSchema.safeParse("Abcdefgh").success).toBe(false);
  });

  it("accepts valid passwords", () => {
    expect(passwordSchema.safeParse("Abcdefg1").success).toBe(true);
  });
});

describe("usernameSchema", () => {
  it("rejects usernames shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects reserved usernames", () => {
    expect(usernameSchema.safeParse("admin").success).toBe(false);
    expect(usernameSchema.safeParse("dashboard").success).toBe(false);
    expect(usernameSchema.safeParse("api").success).toBe(false);
  });

  it("rejects usernames with special characters", () => {
    expect(usernameSchema.safeParse("user@name").success).toBe(false);
    expect(usernameSchema.safeParse("user name").success).toBe(false);
  });

  it("rejects usernames starting or ending with hyphen", () => {
    expect(usernameSchema.safeParse("-username").success).toBe(false);
    expect(usernameSchema.safeParse("username-").success).toBe(false);
  });

  it("accepts valid usernames", () => {
    expect(usernameSchema.safeParse("joao-silva").success).toBe(true);
    expect(usernameSchema.safeParse("maria123").success).toBe(true);
  });
});

describe("emailSchema", () => {
  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("invalid").success).toBe(false);
    expect(emailSchema.safeParse("test@").success).toBe(false);
  });

  it("accepts valid emails", () => {
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
  });
});

describe("bioSchema", () => {
  it("accepts empty bio", () => {
    expect(bioSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects bio over 160 chars", () => {
    expect(bioSchema.safeParse("a".repeat(161)).success).toBe(false);
  });

  it("accepts valid bio", () => {
    expect(bioSchema.safeParse("Criador de conte\u00fado digital").success).toBe(true);
  });
});

describe("displayNameSchema", () => {
  it("rejects empty name", () => {
    expect(displayNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects name over 50 chars", () => {
    expect(displayNameSchema.safeParse("a".repeat(51)).success).toBe(false);
  });

  it("accepts valid name", () => {
    expect(displayNameSchema.safeParse("Jo\u00e3o Silva").success).toBe(true);
  });
});

describe("linkSchema", () => {
  it("rejects links without title", () => {
    expect(linkSchema.safeParse({ url: "https://example.com" }).success).toBe(false);
  });

  it("rejects invalid URLs", () => {
    expect(linkSchema.safeParse({ title: "Test", url: "not-a-url" }).success).toBe(false);
  });

  it("accepts valid links", () => {
    expect(linkSchema.safeParse({ title: "My Site", url: "https://example.com" }).success).toBe(true);
  });
});

describe("productSchema", () => {
  it("rejects products without title", () => {
    expect(productSchema.safeParse({ price: 29.9 }).success).toBe(false);
  });

  it("rejects negative prices", () => {
    expect(productSchema.safeParse({ title: "Ebook", price: -10 }).success).toBe(false);
  });

  it("accepts valid products", () => {
    expect(productSchema.safeParse({ title: "Ebook Marketing", price: 29.9 }).success).toBe(true);
  });
});

describe("validateImageFile", () => {
  it("rejects non-image files", () => {
    const file = new File(["test"], "file.exe", { type: "application/octet-stream" });
    expect(validateImageFile(file)).not.toBeNull();
  });

  it("rejects files over 5MB", () => {
    const data = new ArrayBuffer(6 * 1024 * 1024);
    const file = new File([data], "big.jpg", { type: "image/jpeg" });
    expect(validateImageFile(file)).not.toBeNull();
  });

  it("accepts valid image files", () => {
    const file = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    expect(validateImageFile(file)).toBeNull();
  });
});

describe("validateVideoFile", () => {
  it("rejects non-video files", () => {
    const file = new File(["test"], "file.txt", { type: "text/plain" });
    expect(validateVideoFile(file)).not.toBeNull();
  });

  it("accepts valid video files", () => {
    const file = new File(["test"], "video.mp4", { type: "video/mp4" });
    expect(validateVideoFile(file)).toBeNull();
  });
});

describe("getPasswordStrength", () => {
  it("returns score 0 for empty password", () => {
    expect(getPasswordStrength("").score).toBe(0);
  });

  it("returns higher score for complex passwords", () => {
    const weak = getPasswordStrength("abc");
    const strong = getPasswordStrength("MyP@ssw0rd123!");
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("returns correct labels", () => {
    expect(getPasswordStrength("").label).toBe("Muito fraca");
    expect(getPasswordStrength("MyP@ssw0rd123!").label).toBe("Muito forte");
  });
});
