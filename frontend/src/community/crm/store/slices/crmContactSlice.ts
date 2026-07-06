import { SetType } from "~community/common/types/CommonTypes";
import { CrmContact } from "~community/crm/types/CommonTypes";
import { CrmModalTypes } from "~community/crm/types/ModalTypes";
import { CrmContactSliceTypes } from "~community/crm/types/SliceTypes";

const CrmContactSlice = (
  set: SetType<CrmContactSliceTypes>,
  get: () => CrmContactSliceTypes
) => ({
  isContactModalOpen: false,
  contactModalType: CrmModalTypes.ADD_CONTACT_MODAL,
  selectedContactId: null,
  contacts: {},
  setIsContactModalOpen: (isContactModalOpen: boolean) =>
    set({ isContactModalOpen: isContactModalOpen }),
  setContactModalType: (contactModalType: CrmModalTypes) =>
    set({ contactModalType: contactModalType }),
  setSelectedContactId: (selectedContactId: number | null) =>
    set({ selectedContactId: selectedContactId }),
  setContacts: (contacts: CrmContact[]) =>
    set({ contacts: Object.fromEntries(contacts.map((c) => [c.id, c])) }),
  updateContact: (contact: CrmContact) =>
    set((state) => ({
      contacts: {
        ...state.contacts,
        [contact.id]: { ...state.contacts[contact.id], ...contact }
      }
    })),
  getContactById: (id: number) => get().contacts[id]
});

export default CrmContactSlice;
