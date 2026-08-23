import { useFormik } from "formik";
import { FC, useMemo } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useCreateTask } from "~community/crm/v2/api/TaskApi";
import TaskModalForm from "~community/crm/v2/components/molecules/TaskModalForm/TaskModalForm";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import {
  CrmOwnerEntity,
  CrmTaskEntity
} from "~community/crm/v2/types/CrmCommonTypes";
import {
  mergeTasksRecord,
  prependTaskId,
  toTasksRecord
} from "~community/crm/v2/utils/crmEntityUtils";
import { taskValidations } from "~community/crm/v2/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const {
    setIsTaskModalOpen,
    selectedContactId,
    tasks,
    taskIds,
    setTasks,
    setTaskIds
  } = useCrmStoreV2((state) => ({
    setIsTaskModalOpen: state.setIsTaskModalOpen,
    selectedContactId: state.selectedContactId,
    tasks: state.tasks,
    taskIds: state.taskIds,
    setTasks: state.setTasks,
    setTaskIds: state.setTaskIds
  }));

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;
    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? undefined,
      authPic:
        typeof currentUser.authPic === "string"
          ? currentUser.authPic
          : undefined
    };
  }, [currentUser]);

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: "",
      typeId: undefined,
      dueAt: undefined,
      priority: CrmPriorityEnum.MEDIUM,
      contactId: selectedContactId ?? undefined,
      dealId: undefined,
      ownerId: defaultOwner?.employeeId,
      notes: ""
    }),
    [defaultOwner, selectedContactId]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => createTask(values),
    validationSchema: taskValidations(translateText),
    validateOnChange: false,
    validateOnBlur: false,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleSuccess = (createdTask: CrmTaskEntity) => {
    setSubmitting(false);
    setIsTaskModalOpen(false);

    setTasks(mergeTasksRecord(tasks, toTasksRecord([createdTask])));
    if (createdTask.id !== undefined) {
      setTaskIds(prependTaskId(taskIds, createdTask.id));
    }

    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successTitle"]),
      description: translateText(["successDescription"])
    });
  };

  const handleError = () => {
    setSubmitting(false);
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorTitle"]),
      description: translateText(["errorDescription"])
    });
  };

  const { mutate: createNewTask, isPending } = useCreateTask(
    handleSuccess,
    handleError
  );

  const createTask = (formValues: CrmTaskEntity) => {
    createNewTask({
      ...formValues,
      name: formValues.name?.trim(),
      notes: formValues.notes?.trim()
    });
  };

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      initialOwner={defaultOwner}
    />
  );
};

export default AddTaskModalContent;
