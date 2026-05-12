package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
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

	@BeforeEach
	void setup() {
		crmContactService = Mockito.spy(new CrmContactServiceImpl(crmContactDao, crmCompanyDao, employeeDao,
				crmContactOwnerRepository, crmContactValidationService, userService));
	}

	@Test
	void createContact_whenOwnerNotProvided_assignsCurrentUserAsOwner() {
		CrmContactCreateRequestDto requestDto = new CrmContactCreateRequestDto();
		requestDto.setName("  Jane Doe  ");
		requestDto.setEmail("  JANE@MAIL.COM ");
		requestDto.setContactNumber("  +94770000000  ");

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_ADMIN);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(crmContactDao.save(Mockito.any(CrmContact.class))).thenAnswer(invocation -> {
			CrmContact contact = invocation.getArgument(0);
			contact.setId(1L);
			return contact;
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

		Employee currentEmployee = createEmployee(100L, true, Role.CRM_SALES_MANAGER);
		User currentUser = new User();
		currentUser.setEmployee(currentEmployee);

		Employee requestedOwner = createEmployee(200L, true, Role.CRM_SALES_REPRESENTATIVE);

		when(userService.getCurrentUser()).thenReturn(currentUser);
		when(employeeDao.findById(200L)).thenReturn(Optional.of(requestedOwner));
		when(crmContactDao.save(Mockito.any(CrmContact.class))).thenAnswer(invocation -> invocation.getArgument(0));

		crmContactService.createContact(requestDto);

		ArgumentCaptor<CrmContact> contactCaptor = ArgumentCaptor.forClass(CrmContact.class);
		verify(crmContactDao).save(contactCaptor.capture());
		Assertions.assertEquals(requestedOwner, contactCaptor.getValue().getOwner());
	}

	private Employee createEmployee(Long employeeId, boolean active, Role crmRole) {
		User user = new User();
		user.setIsActive(active);

		EmployeeRole employeeRole = new EmployeeRole();
		employeeRole.setCrmRole(crmRole);

		Employee employee = new Employee();
		employee.setEmployeeId(employeeId);
		employee.setUser(user);
		employee.setEmployeeRole(employeeRole);
		employeeRole.setEmployee(employee);
		user.setEmployee(employee);

		return employee;
	}

}

