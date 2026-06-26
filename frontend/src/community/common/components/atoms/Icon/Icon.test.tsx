import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";

import { IconName, IconProps } from "~community/common/types/IconTypes";

import Icon from "./Icon";

jest.mock(`~community/common/assets/Icons/AddIcon`, () => {
  const MockAddIcon = (props: IconProps) => (
    <svg data-testid="AddIcon" onClick={props.onClick} />
  );
  MockAddIcon.displayName = "MockAddIcon";
  return MockAddIcon;
});

jest.mock(`~community/common/assets/Icons/CloseIcon`, () => {
  const MockCloseIcon = (props: IconProps) => (
    <svg data-testid="CloseIcon" onClick={props.onClick} />
  );
  MockCloseIcon.displayName = "MockCloseIcon";
  return MockCloseIcon;
});

jest.mock(`~community/common/assets/Icons/FileUploadIcon`, () => {
  const MockFileUploadIcon = (props: IconProps) => (
    <svg data-testid="FileUploadIcon" onClick={props.onClick} />
  );
  MockFileUploadIcon.displayName = "MockFileUploadIcon";
  return MockFileUploadIcon;
});

jest.mock(`~community/common/assets/Icons/InformationIcon`, () => {
  const MockInformationIcon = (props: IconProps) => (
    <svg data-testid="InformationIcon" onClick={props.onClick} />
  );
  MockInformationIcon.displayName = "MockInformationIcon";
  return MockInformationIcon;
});

jest.mock(`~community/common/assets/Icons/PlusIcon`, () => {
  const MockPlusIcon = (props: IconProps) => (
    <svg data-testid="PlusIcon" onClick={props.onClick} />
  );
  MockPlusIcon.displayName = "MockPlusIcon";
  return MockPlusIcon;
});

jest.mock(`~community/common/assets/Icons/RightArrowIcon`, () => {
  const MockRightArrowIcon = (props: IconProps) => (
    <svg data-testid="RightArrowIcon" onClick={props.onClick} />
  );
  MockRightArrowIcon.displayName = "MockRightArrowIcon";
  return MockRightArrowIcon;
});

describe("Icon", () => {
  test("renders icon correctly", () => {
    render(<Icon name={IconName.ADD_ICON} />);
  });

  test("should render CloseIcon when name is set as IconName.CLOSE_ICON", () => {
    render(<Icon name={IconName.CLOSE_ICON} />);
    const icon = screen.getByTestId("CloseIcon");
    expect(icon).toBeInTheDocument();
  });

  test("should render PlusIcon when name is set as IconName.PLUS_ICON", () => {
    render(<Icon name={IconName.PLUS_ICON} />);
    const icon = screen.getByTestId("PlusIcon");
    expect(icon).toBeInTheDocument();
  });

  test("should not render any icon if the name is invalid", () => {
    render(<Icon name={"InvalidIcon" as IconName} />);
    const icon = screen.queryByTestId("InvalidIcon");
    expect(icon).not.toBeInTheDocument();
  });

  test("should trigger handleClick function when clicked", () => {
    const handleClick = jest.fn();
    render(<Icon name={IconName.CLOSE_ICON} onClick={handleClick} />);
    const icon = screen.getByTestId("CloseIcon");
    fireEvent.click(icon);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
