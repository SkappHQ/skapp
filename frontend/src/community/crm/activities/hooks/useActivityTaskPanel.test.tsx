import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import {
  useCompleteActivityTask,
  useGetActivityTaskDetail,
  useUpdateActivityTask
} from "~community/crm/activities/api/ActivityTaskApi";
import { useActivityStore } from "~community/crm/activities/store/activityStore";
import {
  ActivityTaskDetail,
  ActivityType
} from "~community/crm/activities/types/activityTypes";

import { useActivityTaskPanel } from "./useActivityTaskPanel";

jest.mock("~community/common/hooks/useTranslator", () => ({
  useTranslator: () => (suffixes: string[]) => suffixes.join(".")
}));

const mockSetToastMessage = jest.fn();

jest.mock("~community/common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: mockSetToastMessage })
}));

jest.mock("~community/crm/activities/api/ActivityTaskApi", () => ({
  useGetActivityTaskDetail: jest.fn(),
  useUpdateActivityTask: jest.fn(),
  useCompleteActivityTask: jest.fn()
}));

const mockUseDetail = useGetActivityTaskDetail as unknown as jest.Mock;
const mockUseUpdate = useUpdateActivityTask as unknown as jest.Mock;
const mockUseComplete = useCompleteActivityTask as unknown as jest.Mock;
const mockUpdate = jest.fn();
const mockComplete = jest.fn();

const detail: ActivityTaskDetail = {
  id: 12,
  name: "Send proposal",
  priority: null,
  dueAt: null,
  isCompleted: false,
  completedAt: null,
  notes: null,
  owner: null,
  contact: null,
  deal: null,
  company: null,
  canComplete: true
};

const renderPanel = () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useActivityTaskPanel(), { wrapper });
};

const completeCallbacks = () => {
  const [onSuccess, onError] = mockUseComplete.mock.calls[
    mockUseComplete.mock.calls.length - 1
  ] as [(...args: unknown[]) => void, () => void];

  return { onSuccess, onError };
};

describe("useActivityTaskPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useActivityStore.getState().resetActivityFeed();
    mockUseDetail.mockReturnValue({
      data: detail,
      isLoading: false,
      isError: false
    });
    mockUseUpdate.mockReturnValue({ mutate: mockUpdate });
    mockUseComplete.mockReturnValue({ mutate: mockComplete });
  });

  it("stays closed with nothing selected", () => {
    const { result } = renderPanel();

    expect(result.current.isOpen).toBe(false);
    expect(mockUseDetail).toHaveBeenLastCalledWith(null);
  });

  it("opens for a selected task and loads its detail", () => {
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });

    const { result } = renderPanel();

    expect(result.current.isOpen).toBe(true);
    expect(mockUseDetail).toHaveBeenLastCalledWith(12);
    expect(result.current.task).toEqual(detail);
    expect(result.current.isEditable).toBe(true);
  });

  it.each([ActivityType.CALL, ActivityType.MEETING, ActivityType.EMAIL])(
    "does not open for a selected %s",
    (type) => {
      useActivityStore.getState().setSelectedActivity({ id: 12, type });

      const { result } = renderPanel();

      expect(result.current.isOpen).toBe(false);
      expect(mockUseDetail).toHaveBeenLastCalledWith(null);
    }
  );

  it("is read only when the viewer cannot complete the task", () => {
    mockUseDetail.mockReturnValue({
      data: { ...detail, canComplete: false },
      isLoading: false,
      isError: false
    });
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });

    const { result } = renderPanel();

    act(() => result.current.onToggleComplete(true));

    expect(result.current.isEditable).toBe(false);
    expect(mockComplete).not.toHaveBeenCalled();
  });

  it("clears the selection on close", () => {
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });
    const { result } = renderPanel();

    act(() => result.current.onClose());

    expect(useActivityStore.getState().selectedActivity).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it("sends only the changed field", () => {
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });
    const { result } = renderPanel();

    act(() => result.current.onUpdate({ notes: "Call back Monday" }));

    expect(mockUpdate).toHaveBeenCalledWith({
      id: 12,
      fields: { notes: "Call back Monday" }
    });
  });

  it("shows the update error toast", () => {
    renderPanel();
    const [, onError] = mockUseUpdate.mock.calls[0];

    act(() => onError());

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "activities.toasts.updateError.title",
      description: "activities.toasts.updateError.description"
    });
  });

  it("closes the panel after marking the task as done", () => {
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });
    const { result } = renderPanel();

    act(() => result.current.onToggleComplete(true));
    expect(mockComplete).toHaveBeenCalledWith({ id: 12, isCompleted: true });

    act(() =>
      completeCallbacks().onSuccess(
        { id: 12, type: ActivityType.TASK, isCompleted: true },
        { id: 12, isCompleted: true }
      )
    );

    expect(useActivityStore.getState().selectedActivity).toBeNull();
    expect(mockSetToastMessage).not.toHaveBeenCalled();
  });

  it("keeps the panel open and confirms a reopen", () => {
    useActivityStore
      .getState()
      .setSelectedActivity({ id: 12, type: ActivityType.TASK });
    const { result } = renderPanel();

    act(() => result.current.onToggleComplete(false));
    act(() =>
      completeCallbacks().onSuccess(
        { id: 12, type: ActivityType.TASK, isCompleted: false },
        { id: 12, isCompleted: false }
      )
    );

    expect(useActivityStore.getState().selectedActivity).not.toBeNull();
    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.SUCCESS,
      title: "activities.toasts.reopenSuccess.title",
      description: "activities.toasts.reopenSuccess.description"
    });
  });

  it("shows the completion error toast", () => {
    renderPanel();

    act(() => completeCallbacks().onError());

    expect(mockSetToastMessage).toHaveBeenCalledWith({
      open: true,
      toastType: ToastType.ERROR,
      title: "activities.toasts.completeError.title",
      description: "activities.toasts.completeError.description"
    });
  });
});
