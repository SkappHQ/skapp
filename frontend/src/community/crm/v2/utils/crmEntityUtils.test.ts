import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { CrmTaskEntity } from "~community/crm/v2/types/CrmCommonTypes";

import {
  appendTaskIds,
  replaceTaskIds,
  toCompaniesFromTasks,
  toContactsFromTasks,
  toDealsFromTasks,
  toOwnersFromTasks,
  toTaskEntity,
  toTasksRecord
} from "./crmEntityUtils";

const task = (id: number | undefined, name: string): CrmTaskEntity => ({
  id,
  name,
  priority: CrmPriorityEnum.LOW,
  isCompleted: false
});

const apiTask = {
  id: 1,
  name: "Call the client",
  typeId: 5,
  priority: CrmPriorityEnum.HIGH,
  isCompleted: false,
  dueAt: "2026-08-20",
  notes: "Bring the quote",
  owner: { employeeId: 7, firstName: "Jane" },
  contact: { id: 3, company: { id: 11, name: "Acme" } },
  deal: { id: 9, name: "Renewal" }
};

describe("toTaskEntity", () => {
  it("keeps only id references, lifting the nested records off the task", () => {
    expect(toTaskEntity(apiTask)).toEqual({
      id: 1,
      name: "Call the client",
      priority: CrmPriorityEnum.HIGH,
      isCompleted: false,
      dueAt: "2026-08-20",
      notes: "Bring the quote",
      typeId: 5,
      ownerId: 7,
      contactId: 3,
      companyId: 11,
      dealId: 9
    });
  });

  it("falls back to an id the payload already sent flat", () => {
    const entity = toTaskEntity({ id: 2, ownerId: 4, contactId: 6, dealId: 8 });

    expect(entity.ownerId).toBe(4);
    expect(entity.contactId).toBe(6);
    expect(entity.dealId).toBe(8);
  });

  it("leaves ids undefined when neither the nested record nor a flat id is set", () => {
    const entity = toTaskEntity({ id: 2 });

    expect(entity.ownerId).toBeUndefined();
    expect(entity.contactId).toBeUndefined();
    expect(entity.companyId).toBeUndefined();
    expect(entity.dealId).toBeUndefined();
  });
});

describe("toTasksRecord", () => {
  it("keys each task by its id and stores it normalized", () => {
    const record = toTasksRecord([apiTask]);

    expect(record[1].ownerId).toBe(7);
    expect(record[1]).not.toHaveProperty("owner");
  });

  it("skips tasks without an id, since ids are optional on the entity", () => {
    expect(Object.keys(toTasksRecord([task(undefined, "Draft")]))).toEqual([]);
  });
});

describe("related records lifted off tasks", () => {
  it("collects owners keyed by employeeId", () => {
    expect(toOwnersFromTasks([apiTask])).toEqual({
      7: { employeeId: 7, firstName: "Jane" }
    });
  });

  it("collects contacts and back-fills the company id reference", () => {
    expect(toContactsFromTasks([apiTask])[3].companyId).toBe(11);
  });

  it("collects companies out of the nested contact", () => {
    expect(toCompaniesFromTasks([apiTask])).toEqual({
      11: { id: 11, name: "Acme" }
    });
  });

  it("collects deals keyed by id", () => {
    expect(toDealsFromTasks([apiTask])).toEqual({
      9: { id: 9, name: "Renewal" }
    });
  });

  it("returns empty records when a task carries no related records", () => {
    expect(toOwnersFromTasks([task(1, "Call")])).toEqual({});
    expect(toContactsFromTasks([task(1, "Call")])).toEqual({});
    expect(toCompaniesFromTasks([task(1, "Call")])).toEqual({});
    expect(toDealsFromTasks([task(1, "Call")])).toEqual({});
  });
});

describe("replaceTaskIds", () => {
  it("preserves the order the response came in, rather than sorting by id", () => {
    expect(
      replaceTaskIds([task(30, "Third"), task(10, "First"), task(20, "Second")])
    ).toEqual([30, 10, 20]);
  });

  it("skips tasks without an id", () => {
    expect(replaceTaskIds([task(undefined, "Draft"), task(7, "Call")])).toEqual(
      [7]
    );
  });
});

describe("appendTaskIds", () => {
  it("appends the next page after the existing ids", () => {
    expect(
      appendTaskIds([1, 2], [task(3, "Third"), task(4, "Fourth")])
    ).toEqual([1, 2, 3, 4]);
  });

  it("drops ids already present so a re-emitted cached page cannot duplicate a row", () => {
    expect(
      appendTaskIds([1, 2], [task(2, "Second"), task(3, "Third")])
    ).toEqual([1, 2, 3]);
  });

  it("does not mutate the array it was given", () => {
    const existingIds = [1, 2];

    appendTaskIds(existingIds, [task(3, "Third")]);

    expect(existingIds).toEqual([1, 2]);
  });

  it("skips tasks without an id", () => {
    expect(appendTaskIds([1], [task(undefined, "Draft")])).toEqual([1]);
  });
});
