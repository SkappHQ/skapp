package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmContactOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmContactOwnerRepository;
import com.skapp.community.crmplanner.service.impl.CrmContactServiceImpl;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmContactServiceImplUnitTest {

	private CrmContactServiceImpl crmContactService;

	@Mock
	private CrmContactDao crmContactDao;

	@Mock
	private CrmCompanyDao crmCompanyDao;

	@Mock
	private EmployeeDao employeeDao;

	@Mock
	private CrmContactOwnerRepository crmContactOwnerRepository;

	@Mock
	private CrmContactValidationService crmContactValidationService;

	@Mock
	private UserService userService;

	@Mock
	private CrmMapper crmMapper;

	@BeforeEach
	void setup() {
		crmContactService = Mockito.spy(new CrmContactServiceImpl(crmContactDao, crmCompanyDao, employeeDao,
				crmContactOwnerRepository, crmContactValidationService, userService, crmMapper));
	}

	@Test
	void createContact_whenOwnerNotProvided_assignsCurrentUserAsOwner() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("  Jane Doe  ");
		requestDto.setEmail("  JANE@MAIL.COM ");
		requestDto.setContactNumber("  +94770000000  ");

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> {
			CrmContact contact = invocation.getArgument(0);
			contact.setId(1L);
			return contact;
		});
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenAnswer(invocation -> {
			CrmContact c = invocation.getArgument(0);
			CrmContactResponseDto dto = new CrmContactResponseDto();
			CrmContactOwnerResponseDto ownerDto = new CrmContactOwnerResponseDto();
			ownerDto.setEmployeeId(c.getOwner().getEmployeeId());
			dto.setOwner(ownerDto);
			return dto;
		});

		ResponseEntityDto response = crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		CrmContact savedContact = contactCaptor.getValue();

		Assertions.assertEquals(currentEmployee, savedContact.getOwner());
		Assertions.assertEquals("Jane Doe", savedContact.getName());
		Assertions.assertEquals("jane@mail.com", savedContact.getEmail());
		Assertions.assertEquals("+94770000000", savedContact.getContactNumber());
		Assertions.assertEquals("successful", response.getStatus());

		CrmContactResponseDto responseDto = (CrmContactResponseDto) response.getResults().get(0);
		Assertions.assertEquals(currentEmployee.getEmployeeId(), responseDto.getOwner().getEmployeeId());
	}

	@Test
	void createContact_whenOwnerProvidedByManager_assignsProvidedOwner() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Alex");
		requestDto.setEmail("alex@mail.com");
		requestDto.setOwnerId(200L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_SALES_MANAGER, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		Employee requestedOwner = createEmployee(200L, true, Role.CRM_SALES_REPRESENTATIVE, false);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(200L)).thenReturn(Optional.of(requestedOwner));
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(requestedOwner, contactCaptor.getValue().getOwner());
	}

	@Test
	void createContact_whenSuperAdminAssignsOwner_succeeds() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Bob");
		requestDto.setEmail("bob@mail.com");
		requestDto.setOwnerId(300L);

		Employee currentEmployee = createEmployee(100L, true, null, true);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		Employee targetOwner = createEmployee(300L, true, Role.CRM_SALES_REPRESENTATIVE, false);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(300L)).thenReturn(Optional.of(targetOwner));
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(targetOwner, contactCaptor.getValue().getOwner());
	}

	@Test
	void createContact_whenSalesRepProvidesNoOwnerId_autoAssignsSelf() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Carol");
		requestDto.setEmail("carol@mail.com");

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_SALES_REPRESENTATIVE, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(currentEmployee, contactCaptor.getValue().getOwner());
	}

	@Test
	void createContact_whenSalesRepProvidesSelfAsOwnerId_assignsSelf() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Dave");
		requestDto.setEmail("dave@mail.com");
		requestDto.setOwnerId(100L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_SALES_REPRESENTATIVE, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(currentEmployee, contactCaptor.getValue().getOwner());
	}

	@Test
	void createContact_whenSalesRepTriesToAssignDifferentOwner_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Eve");
		requestDto.setEmail("eve@mail.com");
		requestDto.setOwnerId(999L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_SALES_REPRESENTATIVE, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	@Test
	void createContact_whenCurrentUserHasNoEmployee_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Frank");
		requestDto.setEmail("frank@mail.com");

		User currentUser = new User();

		when(userService.getCurrentUser()).thenReturn(currentUser);

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	@Test
	void createContact_whenAssignedOwnerNotFound_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Grace");
		requestDto.setEmail("grace@mail.com");
		requestDto.setOwnerId(999L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(999L)).thenReturn(Optional.empty());

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	@Test
	void createContact_whenAssignedOwnerIsInactive_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Hank");
		requestDto.setEmail("hank@mail.com");
		requestDto.setOwnerId(200L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		Employee inactiveOwner = createEmployee(200L, false, Role.CRM_SALES_REPRESENTATIVE, false);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(200L)).thenReturn(Optional.of(inactiveOwner));

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	@Test
	void createContact_whenAssignedOwnerHasNoCrmRole_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Iris");
		requestDto.setEmail("iris@mail.com");
		requestDto.setOwnerId(200L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		Employee noRoleOwner = createEmployee(200L, true, null, false);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(200L)).thenReturn(Optional.of(noRoleOwner));

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	@Test
	void createContact_whenNullContactNumber_savesWithNullContactNumber() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Jack");
		requestDto.setEmail("jack@mail.com");
		requestDto.setContactNumber(null);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertNull(contactCaptor.getValue().getContactNumber());
	}

	@Test
	void createContact_whenCompanyProvided_savesContactWithCompany() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Karen");
		requestDto.setEmail("karen@mail.com");
		requestDto.setCompanyId(10L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		CrmCompany company = new CrmCompany();
		company.setId(10L);
		company.setName("Acme Corp");

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmCompanyDao.findByIdAndIsDeletedFalse(10L)).thenReturn(Optional.of(company));
		when(crmContactDao.save(any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));
		when(crmMapper.crmContactToCrmContactResponseDto(any(CrmContact.class))).thenReturn(new CrmContactResponseDto());

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(company, contactCaptor.getValue().getCompany());
	}

	@Test
	void createContact_whenCompanyNotFound_throwsException() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("Leo");
		requestDto.setEmail("leo@mail.com");
		requestDto.setCompanyId(999L);

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN, false);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmCompanyDao.findByIdAndIsDeletedFalse(999L)).thenReturn(Optional.empty());

		Assertions.assertThrows(RuntimeException.class, () -> crmContactService.createContact(requestDto));
	}

	private Employee createEmployee(Long employeeId, boolean active, Role crmRole, boolean isSuperAdmin) {
		User user = new User();
		user.setIsActive(active);

		EmployeeRole employeeRole = new EmployeeRole();
		employeeRole.setCrmRole(crmRole);
		employeeRole.setIsSuperAdmin(isSuperAdmin);

		Employee employee = new Employee();
		employee.setEmployeeId(employeeId);
		employee.setUser(user);
		employee.setEmployeeRole(employeeRole);
		employeeRole.setEmployee(employee);
		user.setEmployee(employee);

		return employee;
	}

}

