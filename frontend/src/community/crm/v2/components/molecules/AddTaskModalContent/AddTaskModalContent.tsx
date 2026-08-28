import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

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
import { mergeOwners } from "~community/crm/v2/utils/commonUtil";
import {
  prependTaskId,
  updateTaskRecord
} from "~community/crm/v2/utils/taskUtil";
import { getTaskValidationSchema } from "~community/crm/v2/utils/taskValidations";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

const AddTaskModalContent: FC = () => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("crmModule", "tasks", "addTaskModal");

  const {
    tasks,
    taskIds,
    owners,
    setTasks,
    setTaskIds,
    setOwners,
    setIsTaskModalOpen
  } = useCrmStoreV2(
    useShallow((store) => ({
      tasks: store.tasks,
      taskIds: store.taskIds,
      owners: store.owners,
      setTasks: store.setTasks,
      setTaskIds: store.setTaskIds,
      setOwners: store.setOwners,
      setIsTaskModalOpen: store.setIsTaskModalOpen
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;

    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [currentUser]);

  useEffect(() => {
    if (!defaultOwner) return;

    setOwners(mergeOwners(owners, [defaultOwner]));
  }, [defaultOwner]);

  const initialValues: CrmTaskEntity = useMemo(
    () => ({
      name: "",
      typeId: undefined,
      priority: CrmPriorityEnum.MEDIUM,
      dueAt: undefined,
      ownerId: defaultOwner?.employeeId,
      contactId: undefined,
      dealId: undefined,
      notes: ""
    }),
    [defaultOwner]
  );

  const formik = useFormik<CrmTaskEntity>({
    initialValues,
    onSubmit: (values) => createTask(values),
    validationSchema: getTaskValidationSchema(translateText),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { setSubmitting } = formik;

  const handleCloseModal = (): void => {
    setIsTaskModalOpen(false);
  };

  const handleSuccess = (createdTask: CrmTaskEntity) => {
    setSubmitting(false);

    if (createdTask.id !== undefined) {
      setTasks(updateTaskRecord(tasks, [createdTask]));
      setTaskIds(prependTaskId(taskIds, createdTask.id));
    }

    handleCloseModal();
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

  const createTask = (values: CrmTaskEntity) => {
    createNewTask({
      ...values,
      name: values.name?.trim(),
      notes: values.notes?.trim()
    });
  };

  return (
    <TaskModalForm
      formik={formik}
      isPending={isPending}
      translateText={translateText}
      onCancel={handleCloseModal}
    />
  );
};

export default AddTaskModalContent;
