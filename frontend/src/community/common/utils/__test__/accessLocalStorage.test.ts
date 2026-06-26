import {
  getDataFromLocalStorage,
  removeDataFromLocalStorage,
  setDataToLocalStorage
} from "../accessLocalStorage";

describe("LocalStorage Utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("setDataToLocalStorage should store data in localStorage", async () => {
    const testKey = "testKey";
    const testData = { name: "Test User", age: 30 };

    await setDataToLocalStorage(testKey, testData);

    const storedData = localStorage.getItem(testKey);
    expect(storedData).toBe(JSON.stringify(testData));
  });

  test("getDataFromLocalStorage should retrieve data from localStorage", () => {
    const testKey = "testKey";
    const testData = { name: "Test User", age: 30 };

    localStorage.setItem(testKey, JSON.stringify(testData));

    const result = getDataFromLocalStorage(testKey);
    expect(result).toEqual(testData);
  });

  test("getDataFromLocalStorage should return null for non-existing key", () => {
    const result = getDataFromLocalStorage("nonExistingKey");
    expect(result).toBe(null);
  });

  test("removeDataFromLocalStorage should remove data from localStorage", async () => {
    const testKey = "testKey";
    const testData = { name: "Test User", age: 30 };

    localStorage.setItem(testKey, JSON.stringify(testData));
    await removeDataFromLocalStorage(testKey);

    const result = localStorage.getItem(testKey);
    expect(result).toBe(null);
  });
});
