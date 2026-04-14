import { describe, it, expect, beforeEach } from "vitest";
import { createMockSupabase } from "./mockSupabase";

describe("mockSupabase", () => {
  describe("Auth", () => {
    it("should return current session", async () => {
      const supabase = createMockSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeDefined();
      expect(session?.user).toBeDefined();
    });
  });
});
