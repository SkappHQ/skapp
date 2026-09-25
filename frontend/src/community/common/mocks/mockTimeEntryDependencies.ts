jest.mock("~community/common/hooks/useDisplayZone", () => ({
  useDisplayZone: jest.fn(() => "UTC")
}));

jest.mock(
  "@rootcodelabs/skapp-ui",
  () => require("~community/common/mocks/MockSkappUi"),
  { virtual: true }
);
