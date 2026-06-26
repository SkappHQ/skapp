import { create } from "zustand";

import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

import { directoryModalSlice } from "./directoryModalSlice";

describe("directoryModalSlice", () => {
  it("should set isDirectoryModalOpen correctly", () => {
    const useStore = create(directoryModalSlice);
    const { setIsDirectoryModalOpen } = useStore.getState();

    setIsDirectoryModalOpen(true);
    expect(useStore.getState().isDirectoryModalOpen).toBe(true);

    setIsDirectoryModalOpen(false);
    expect(useStore.getState().isDirectoryModalOpen).toBe(false);
  });

  it("should set directoryModalType correctly", () => {
    const useStore = create(directoryModalSlice);
    const { setDirectoryModalType } = useStore.getState();

    setDirectoryModalType(DirectoryModalTypes.BULK_UPLOAD);
    expect(useStore.getState().directoryModalType).toBe(
      DirectoryModalTypes.BULK_UPLOAD
    );
    expect(useStore.getState().isDirectoryModalOpen).toBe(true);

    setDirectoryModalType(DirectoryModalTypes.NONE);
    expect(useStore.getState().directoryModalType).toBe(
      DirectoryModalTypes.NONE
    );
    expect(useStore.getState().isDirectoryModalOpen).toBe(false);
  });

  it("should set bulkUploadUsers correctly", () => {
    const useStore = create(directoryModalSlice);
    const { setBulkUploadUsers } = useStore.getState();

    const mockUsers = [{ id: 1, name: "John Doe" }];
    setBulkUploadUsers(mockUsers);

    expect(useStore.getState().bulkUploadUsers).toEqual(mockUsers);
  });

  it("should set sharedCredentialData correctly", () => {
    const useStore = create(directoryModalSlice);
    const { setSharedCredentialData } = useStore.getState();

    const mockData = { id: 1, email: "john.doe@example.com" };
    setSharedCredentialData(mockData);

    expect(useStore.getState().sharedCredentialData).toEqual(mockData);
  });
});
