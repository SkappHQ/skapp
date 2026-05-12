package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.service.impl.CrmContactOwnerReassignmentServiceImpl;
import com.skapp.community.peopleplanner.model.Employee;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmContactOwnerReassignmentServiceImplUnitTest {

	private CrmContactOwnerReassignmentServiceImpl crmContactOwnerReassignmentService;

	@Mock
	private CrmContactDao crmContactDao;

	@Mock
	private CrmContactOwnerRepository crmContactOwnerRepository;

	@BeforeEach
	void setup() {
		crmContactOwnerReassignmentService = Mockito
			.spy(new CrmContactOwnerReassignmentServiceImpl(crmContactDao, crmContactOwnerRepository));
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_reassignsToFallbackAdmin() {
		Employee deactivatedOwner = createEmployee(10L);
		User deactivatedUser = new User();
		deactivatedUser.setEmployee(deactivatedOwner);

		CrmContact firstContact = new CrmContact();
		firstContact.setOwner(deactivatedOwner);
		CrmContact secondContact = new CrmContact();
		secondContact.setOwner(deactivatedOwner);

		Employee fallbackOwner = createEmployee(99L);

		when(crmContactDao.findByOwnerInAndIsDeletedFalse(List.of(deactivatedOwner)))
			.thenReturn(List.of(firstContact, secondContact));
		when(crmContactOwnerRepository.findFallbackAdminOwner()).thenReturn(Optional.of(fallbackOwner));

		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(deactivatedUser));

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<CrmContact>> contactsCaptor = ArgumentCaptor
			.forClass((Class<List<CrmContact>>) (Class<?>) List.class);
		verify(crmContactDao).saveAll(contactsCaptor.capture());

		List<CrmContact> savedContacts = contactsCaptor.getValue();
		Assertions.assertEquals(2, savedContacts.size());
		Assertions.assertEquals(fallbackOwner, savedContacts.get(0).getOwner());
		Assertions.assertEquals(fallbackOwner, savedContacts.get(1).getOwner());
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_withMultipleDeactivatedOwners_reassignsAllContacts() {
		Employee firstOwner = createEmployee(10L);
		Employee secondOwner = createEmployee(20L);

		User firstUser = new User();
		firstUser.setEmployee(firstOwner);
		User secondUser = new User();
		secondUser.setEmployee(secondOwner);

		CrmContact firstContact = new CrmContact();
		firstContact.setOwner(firstOwner);
		CrmContact secondContact = new CrmContact();
		secondContact.setOwner(secondOwner);

		Employee fallbackOwner = createEmployee(99L);

		when(crmContactDao.findByOwnerInAndIsDeletedFalse(List.of(firstOwner, secondOwner)))
			.thenReturn(List.of(firstContact, secondContact));
		when(crmContactOwnerRepository.findFallbackAdminOwner()).thenReturn(Optional.of(fallbackOwner));

		crmContactOwnerReassignmentService
			.reassignContactsOwnedByDeactivatedUsers(List.of(firstUser, secondUser));

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<CrmContact>> contactsCaptor = ArgumentCaptor
			.forClass((Class<List<CrmContact>>) (Class<?>) List.class);
		verify(crmContactDao).saveAll(contactsCaptor.capture());

		List<CrmContact> savedContacts = contactsCaptor.getValue();
		Assertions.assertEquals(2, savedContacts.size());
		savedContacts.forEach(c -> Assertions.assertEquals(fallbackOwner, c.getOwner()));
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_whenNoMappedEmployees_doesNotQueryContacts() {
		User userWithoutEmployee = new User();

		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(userWithoutEmployee));

		verify(crmContactDao, never()).findByOwnerInAndIsDeletedFalse(Mockito.anyList());
		verify(crmContactOwnerRepository, never()).findFallbackAdminOwner();
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_whenNoContactsOwnedByDeactivatedUser_doesNotSave() {
		Employee deactivatedOwner = createEmployee(10L);
		User deactivatedUser = new User();
		deactivatedUser.setEmployee(deactivatedOwner);

		when(crmContactDao.findByOwnerInAndIsDeletedFalse(List.of(deactivatedOwner))).thenReturn(List.of());

		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of(deactivatedUser));

		verify(crmContactOwnerRepository, never()).findFallbackAdminOwner();
		verify(crmContactDao, never()).saveAll(Mockito.anyList());
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_whenNoFallbackAdminFound_throwsIllegalStateException() {
		Employee deactivatedOwner = createEmployee(10L);
		User deactivatedUser = new User();
		deactivatedUser.setEmployee(deactivatedOwner);

		CrmContact contact = new CrmContact();
		contact.setOwner(deactivatedOwner);

		when(crmContactDao.findByOwnerInAndIsDeletedFalse(List.of(deactivatedOwner))).thenReturn(List.of(contact));
		when(crmContactOwnerRepository.findFallbackAdminOwner()).thenReturn(Optional.empty());

		Assertions.assertThrows(IllegalStateException.class, () -> crmContactOwnerReassignmentService
			.reassignContactsOwnedByDeactivatedUsers(List.of(deactivatedUser)));

		verify(crmContactDao, never()).saveAll(Mockito.anyList());
	}

	@Test
	void reassignContactsOwnedByDeactivatedUsers_whenEmptyUserList_doesNotQueryContacts() {
		crmContactOwnerReassignmentService.reassignContactsOwnedByDeactivatedUsers(List.of());

		verify(crmContactDao, never()).findByOwnerInAndIsDeletedFalse(Mockito.anyList());
		verify(crmContactOwnerRepository, never()).findFallbackAdminOwner();
	}

	private Employee createEmployee(Long employeeId) {
		Employee employee = new Employee();
		employee.setEmployeeId(employeeId);
		return employee;
	}

}

