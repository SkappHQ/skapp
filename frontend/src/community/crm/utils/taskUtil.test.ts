jest.mock(
  "@rootcodelabs/skapp-ui",
  () => new Proxy({}, { get: () => () => null }),
  { virtual: true }
);

import { CrmPriorityEnum } from "~community/crm/enums/common";

import { CrmTaskDetailType } from "../types/CommonTypes";
import { mapTaskToTaskRowResponse } from "./taskUtil";

const baseTask: CrmTaskDetailType = {
  id: 1,
  name: "Follow up call",
  typeId: 2,
  typeName: "Call",
  priority: CrmPriorityEnum.HIGH,
  isCompleted: false,
  dueAt: "2026-06-30T10:00:00Z",
  notes: null,
  contactId: 5,
  ownerName: "Alex Stone",
  owner: {
    employeeId: 10,
    firstName: "Alex",
    lastName: "Stone",
    authPic: null
  },
  contact: { id: 5, name: "Jane Doe" },
  deal: null
};

describe("mapTaskToTaskRowResponse", () => {
  it("maps all fields from CrmTaskDetailType to TaskRowResponseType", () => {
    const result = mapTaskToTaskRowResponse(baseTask);

    expect(result).toEqual({
      id: 1,
      name: "Follow up call",
      type: "Call",
      priority: CrmPriorityEnum.HIGH,
      isCompleted: false,
      dueAt: "2026-06-30T10:00:00Z",
      owner: {
        employeeId: 10,
        firstName: "Alex",
        lastName: "Stone",
        authPic: null
      },
      contact: { id: 5, name: "Jane Doe" }
    });
  });

  it("preserves null dueAt and contact", () => {
    const result = mapTaskToTaskRowResponse({
      ...baseTask,
      dueAt: null,
      contact: null
    });
    expect(result.dueAt).toBeNull();
    expect(result.contact).toBeNull();
  });
});
