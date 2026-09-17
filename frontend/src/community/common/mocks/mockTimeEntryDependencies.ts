jest.mock("~community/common/hooks/useDisplayZone", () => ({
  useEntryZone: jest.fn(() => "UTC")
}));

jest.mock(
  "@rootcodelabs/skapp-ui",
  () => require("~community/common/mocks/MockSkappUi"),
  { virtual: true }
);
