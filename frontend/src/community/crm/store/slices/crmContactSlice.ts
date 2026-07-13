import { SetType } from "~community/common/types/CommonTypes";
import { CrmContact } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactSliceTypes } from "~community/crm/types/SliceTypes";
import { mergeContactUpdate } from "~community/crm/utils/contactUtil";
import { mergeWithExisting } from "~community/crm/utils/crmUtil";

const CrmContactSlice = (
  set: SetType<CrmContactSliceTypes>,
  get: () => CrmContactSliceTypes
) => ({
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  selectedContactId: null,
  contacts: [],
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen: isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContactId: (selectedContactId: number | null) =>
    set({ selectedContactId: selectedContactId }),
  setContacts: (contacts: CrmContact[]) =>
    set({ contacts: mergeWithExisting(get().contacts, contacts) }),
  updateContact: (contact: CrmContact) =>
    set({ contacts: mergeContactUpdate(get().contacts, contact) }),
  removeContact: (id: number) =>
    set({ contacts: get().contacts.filter((contact) => contact.id !== id) }),
  getContactById: (id: number) =>
    get().contacts.find((contact) => contact.id === id)
});

export default CrmContactSlice;
