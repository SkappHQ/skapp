import { StoreApi } from "zustand";

export type SetType<T> = StoreApi<T>["setState"];
