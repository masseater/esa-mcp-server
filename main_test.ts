import { assertEquals } from "jsr:@std/assert";

Deno.test("Simple Sync Test", () => {
    assertEquals(1 + 1, 2, "Basic arithmetic check");
});
