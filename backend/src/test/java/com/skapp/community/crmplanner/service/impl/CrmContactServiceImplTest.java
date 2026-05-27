package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CrmContactServiceImpl Unit Tests")
class CrmContactServiceImplTest {

	private static final Long CONTACT_ID = 10L;

	private static final Long COMPANY_ID = 20L;

	private static final Long OWNER_ID = 99L;

	private static final String CONTACT_EMAIL = "original@example.com";

	@Mock
	private CrmContactDao crmContactDao;

	@Mock
	private CrmCompanyDao crmCompanyDao;

	@Mock
	private CrmDealDao crmDealDao;

	@Mock
	private CrmTaskDao crmTaskDao;

	@Mock
	private EmployeeDao employeeDao;

	@Mock
	private CrmContactOwnerRepository crmContactOwnerRepository;

	@Mock
	private UserService userService;

	@Mock
	private MessageUtil messageUtil;

	@Mock
	private CrmMapper crmMapper;

	@InjectMocks
	private CrmContactServiceImpl service;

	// --- Factories ---

	private Employee makeEmployee(Long id, Role crmRole, boolean isSuperAdmin) {
		EmployeeRole role = new EmployeeRole();
		role.setCrmRole(crmRole);
		role.setIsSuperAdmin(isSuperAdmin);

		User user = new User();
		user.setIsActive(true);

		Employee emp = new Employee();
		emp.setEmployeeId(id);
		emp.setEmployeeRole(role);
		emp.setUser(user);
		return emp;
	}

	private User makeUser(Employee employee) {
		User user = new User();
		user.setUserId(employee.getEmployeeId());
		user.setIsActive(true);
		user.setEmployee(employee);
		return user;
	}

	private CrmContact makeContact(Employee owner) {
		CrmContact contact = new CrmContact();
		contact.setId(CONTACT_ID);
		contact.setName("Test Contact");
		contact.setEmail(CONTACT_EMAIL);
		contact.setOwner(owner);
		return contact;
	}

	private CrmContactEditRequestDto validEditDto() {
		CrmContactEditRequestDto dto = new CrmContactEditRequestDto();
		dto.setName("Updated Name");
		dto.setEmail(CONTACT_EMAIL);
		dto.setCompanyId(COMPANY_ID);
		dto.setOwnerId(OWNER_ID);
		return dto;
	}

	private void stubHappyPathTail(Employee owner) {
		when(crmCompanyDao.getReferenceById(COMPANY_ID)).thenReturn(new CrmCompany());
		when(employeeDao.findById(OWNER_ID)).thenReturn(Optional.of(owner));
		when(crmContactDao.save(any())).thenReturn(makeContact(owner));
		when(crmMapper.crmContactToCrmContactResponseDto(any())).thenReturn(new CrmContactResponseDto());
	}

	// --- createContact ---

	private CrmContactCreateRequestDto validCreateDto() {
		CrmContactCreateRequestDto dto = new CrmContactCreateRequestDto();
		dto.setName("Jane Smith");
		dto.setEmail("jane.smith@example.com");
		dto.setCompanyId(COMPANY_ID);
		dto.setOwnerId(OWNER_ID);
		return dto;
	}

	@Nested
	@DisplayName("createContact")
	class CreateContact {

		@Test
		@DisplayName("Happy path - contact saved and response returned")
		void createContact_HappyPath_Succeeds() {
			Employee owner = makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false);
			when(userService.getCurrentUser()).thenReturn(makeUser(owner));
			when(crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse("jane.smith@example.com")).thenReturn(false);
			when(crmCompanyDao.getReferenceById(COMPANY_ID)).thenReturn(new CrmCompany());
			when(employeeDao.findById(OWNER_ID)).thenReturn(Optional.of(owner));
			when(crmContactDao.save(any())).thenAnswer(inv -> inv.getArgument(0));
			when(crmMapper.crmContactToCrmContactResponseDto(any())).thenReturn(new CrmContactResponseDto());

			assertDoesNotThrow(() -> service.createContact(validCreateDto()));
			verify(crmContactDao).existsByEmailIgnoreCaseAndIsDeletedFalse("jane.smith@example.com");
			verify(crmCompanyDao).getReferenceById(COMPANY_ID);
		}

		@Test
		@DisplayName("Duplicate email - throws CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS")
		void createContact_DuplicateEmail_ThrowsEmailAlreadyExists() {
			Employee owner = makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false);
			when(userService.getCurrentUser()).thenReturn(makeUser(owner));
			when(crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse("jane.smith@example.com")).thenReturn(true);

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.createContact(validCreateDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS, ex.getMessageKey());
			verify(crmContactDao, never()).save(any());
		}

	}

	// --- Contact retrieval ---

	@Nested
	@DisplayName("editContact - contact retrieval")
	class ContactRetrieval {

		@Test
		@DisplayName("Contact not found - throws CRM_ERROR_CONTACT_NOT_FOUND")
		void editContact_ContactNotFound_ThrowsNotFound() {
			when(userService.getCurrentUser()).thenReturn(makeUser(makeEmployee(1L, Role.CRM_ADMIN, false)));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.empty());

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND, ex.getMessageKey());
		}

		@Test
		@DisplayName("Soft-deleted contact - findByIdAndIsDeletedFalse returns empty - throws CRM_ERROR_CONTACT_NOT_FOUND")
		void editContact_SoftDeletedContact_ThrowsNotFound() {
			// The query filters isDeleted=false, so a soft-deleted record returns empty - same error path
			when(userService.getCurrentUser()).thenReturn(makeUser(makeEmployee(1L, Role.CRM_ADMIN, false)));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.empty());

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND, ex.getMessageKey());
		}

	}

	// --- checkEditPermission ---

	@Nested
	@DisplayName("editContact - checkEditPermission")
	class CheckEditPermission {

		@Test
		@DisplayName("currentEmployee is null - throws CRM_ERROR_CONTACT_EDIT_DENIED")
		void editContact_NullCurrentEmployee_ThrowsEditDenied() {
			User userWithNoEmployee = new User();
			userWithNoEmployee.setUserId(1L);
			userWithNoEmployee.setEmployee(null);

			when(userService.getCurrentUser()).thenReturn(userWithNoEmployee);
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID))
				.thenReturn(Optional.of(makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false))));

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Employee with no CRM role and not super admin - throws CRM_ERROR_CONTACT_EDIT_DENIED")
		void editContact_NoCrmRoleNotSuperAdmin_ThrowsEditDenied() {
			Employee currentEmp = makeEmployee(1L, null, false);
			when(userService.getCurrentUser()).thenReturn(makeUser(currentEmp));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID))
				.thenReturn(Optional.of(makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false))));

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Sales rep editing a contact owned by a different employee - throws CRM_ERROR_CONTACT_EDIT_DENIED")
		void editContact_RepEditingOtherOwnerContact_ThrowsEditDenied() {
			Employee rep = makeEmployee(1L, Role.CRM_SALES_REPRESENTATIVE, false);
			Employee otherOwner = makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false);
			CrmContact contact = makeContact(otherOwner);

			when(userService.getCurrentUser()).thenReturn(makeUser(rep));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Sales rep editing their own contact - succeeds")
		void editContact_RepEditingOwnContact_Succeeds() {
			Employee rep = makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false);
			CrmContact contact = makeContact(rep);

			when(userService.getCurrentUser()).thenReturn(makeUser(rep));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			when(crmCompanyDao.getReferenceById(COMPANY_ID)).thenReturn(new CrmCompany());
			when(crmContactDao.save(any())).thenReturn(contact);
			when(crmMapper.crmContactToCrmContactResponseDto(any())).thenReturn(new CrmContactResponseDto());

			// Rep must assign contact to themselves (ownerId == rep.employeeId)
			CrmContactEditRequestDto dto = validEditDto();
			dto.setOwnerId(OWNER_ID);

			assertDoesNotThrow(() -> service.editContact(CONTACT_ID, dto));
		}

		@Test
		@DisplayName("CRM_SALES_MANAGER editing any contact - succeeds")
		void editContact_SalesManagerEditingAnyContact_Succeeds() {
			Employee manager = makeEmployee(1L, Role.CRM_SALES_MANAGER, false);
			Employee contactOwner = makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false);

			when(userService.getCurrentUser()).thenReturn(makeUser(manager));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID))
				.thenReturn(Optional.of(makeContact(contactOwner)));
			stubHappyPathTail(makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false));

			assertDoesNotThrow(() -> service.editContact(CONTACT_ID, validEditDto()));
		}

		@Test
		@DisplayName("CRM_ADMIN editing any contact - succeeds")
		void editContact_CrmAdminEditingAnyContact_Succeeds() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			Employee contactOwner = makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false);

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID))
				.thenReturn(Optional.of(makeContact(contactOwner)));
			stubHappyPathTail(makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false));

			assertDoesNotThrow(() -> service.editContact(CONTACT_ID, validEditDto()));
		}

		@Test
		@DisplayName("Super admin editing any contact - succeeds")
		void editContact_SuperAdminEditingAnyContact_Succeeds() {
			Employee superAdmin = makeEmployee(1L, null, true);
			Employee contactOwner = makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false);

			when(userService.getCurrentUser()).thenReturn(makeUser(superAdmin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID))
				.thenReturn(Optional.of(makeContact(contactOwner)));
			stubHappyPathTail(makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false));

			assertDoesNotThrow(() -> service.editContact(CONTACT_ID, validEditDto()));
		}

	}

	// --- Email uniqueness ---

	@Nested
	@DisplayName("editContact - email uniqueness")
	class EmailUniqueness {

		@Test
		@DisplayName("Email unchanged - uniqueness check is NOT called")
		void editContact_EmailUnchanged_SkipsUniquenessQuery() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			CrmContact contact = makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false));

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			stubHappyPathTail(makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false));

			// dto email equals contact email (both "original@example.com")
			CrmContactEditRequestDto dto = validEditDto();
			dto.setEmail(CONTACT_EMAIL);

			service.editContact(CONTACT_ID, dto);

			verify(crmContactDao, never()).existsByEmailIgnoreCaseAndIsDeletedFalseAndIdNot(anyString(), any());
		}

		@Test
		@DisplayName("Email changed to one used by another contact - throws CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS")
		void editContact_EmailChangedToExistingOne_ThrowsEmailAlreadyExists() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			CrmContact contact = makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false));

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			when(crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalseAndIdNot("taken@example.com", CONTACT_ID))
				.thenReturn(true);

			CrmContactEditRequestDto dto = validEditDto();
			dto.setEmail("taken@example.com");

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, dto));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS, ex.getMessageKey());
		}

		@Test
		@DisplayName("Email changed but not taken - uniqueness check is called and edit succeeds")
		void editContact_EmailChangedAndNotTaken_Succeeds() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			CrmContact contact = makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false));

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			when(crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalseAndIdNot("free@example.com", CONTACT_ID))
				.thenReturn(false);
			stubHappyPathTail(makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false));

			CrmContactEditRequestDto dto = validEditDto();
			dto.setEmail("free@example.com");

			assertDoesNotThrow(() -> service.editContact(CONTACT_ID, dto));
			verify(crmContactDao).existsByEmailIgnoreCaseAndIsDeletedFalseAndIdNot(eq("free@example.com"),
					eq(CONTACT_ID));
		}

	}

	// --- resolveOwner ---

	@Nested
	@DisplayName("editContact - resolveOwner")
	class ResolveOwner {

		@Test
		@DisplayName("Sales rep assigning contact to a different owner - throws CRM_ERROR_OWNER_ASSIGNMENT_DENIED")
		void editContact_RepAssigningToDifferentOwner_ThrowsAssignmentDenied() {
			Long repId = 5L;
			Long differentOwnerId = 6L;

			Employee rep = makeEmployee(repId, Role.CRM_SALES_REPRESENTATIVE, false);
			CrmContact contact = makeContact(rep);

			when(userService.getCurrentUser()).thenReturn(makeUser(rep));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));

			CrmContactEditRequestDto dto = validEditDto();
			dto.setOwnerId(differentOwnerId);

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, dto));
			assertEquals(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Owner has no active user - throws CRM_ERROR_OWNER_INACTIVE")
		void editContact_InactiveOwner_ThrowsOwnerInactive() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			CrmContact contact = makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false));

			Employee inactiveOwner = makeEmployee(OWNER_ID, Role.CRM_SALES_REPRESENTATIVE, false);
			inactiveOwner.getUser().setIsActive(false);

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			when(employeeDao.findById(OWNER_ID)).thenReturn(Optional.of(inactiveOwner));

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_OWNER_INACTIVE, ex.getMessageKey());
		}

		@Test
		@DisplayName("Owner has no CRM role and is not super admin - throws CRM_ERROR_OWNER_INVALID_ROLE")
		void editContact_OwnerWithNoAssignableRole_ThrowsOwnerInvalidRole() {
			Employee admin = makeEmployee(1L, Role.CRM_ADMIN, false);
			CrmContact contact = makeContact(makeEmployee(2L, Role.CRM_SALES_REPRESENTATIVE, false));

			Employee noRoleOwner = makeEmployee(OWNER_ID, null, false);

			when(userService.getCurrentUser()).thenReturn(makeUser(admin));
			when(crmContactDao.findByIdAndIsDeletedFalse(CONTACT_ID)).thenReturn(Optional.of(contact));
			when(employeeDao.findById(OWNER_ID)).thenReturn(Optional.of(noRoleOwner));

			ModuleException ex = assertThrows(ModuleException.class,
					() -> service.editContact(CONTACT_ID, validEditDto()));
			assertEquals(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE, ex.getMessageKey());
		}

	}

}
