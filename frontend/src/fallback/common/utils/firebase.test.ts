import { database } from "./firebase";

describe("Firebase Configuration should be undefined", () => {
  it("should export a undefined", () => {
    expect(database).toBeUndefined();
  });
});
