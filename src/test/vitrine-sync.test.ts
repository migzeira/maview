import { describe, it, expect, beforeEach } from "vitest";
import { loadLocal, saveLocal, type VitrineConfig } from "@/lib/vitrine-sync";

describe("vitrine-sync localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadLocal returns empty object when no data", () => {
    expect(loadLocal()).toEqual({});
  });

  it("saveLocal and loadLocal roundtrip", () => {
    const config: VitrineConfig = {
      displayName: "Jo\u00e3o",
      username: "@joao",
      bio: "Criador de conte\u00fado",
      theme: "dark-purple",
      links: [{ title: "Site", url: "https://example.com" }],
    };
    saveLocal(config);
    const loaded = loadLocal();
    expect(loaded.displayName).toBe("Jo\u00e3o");
    expect(loaded.username).toBe("@joao");
    expect(loaded.links).toHaveLength(1);
  });

  it("loadLocal handles corrupted data gracefully", () => {
    localStorage.setItem("maview_vitrine_config", "not-json");
    expect(loadLocal()).toEqual({});
  });
});
