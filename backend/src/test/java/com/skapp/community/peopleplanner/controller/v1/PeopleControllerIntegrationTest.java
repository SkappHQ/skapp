package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeContactNumberRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeJoinedDateRequestDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.payload.request.EmployeeUpdateDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeCommonDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeePersonalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsManagerDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentIdentificationAndDiversityDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalContactDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalGeneralDetailsDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import com.skapp.TestSkappApplication;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("People Controller Integration Tests")
class PeopleControllerIntegrationTest {

	private final JsonMapper objectMapper;

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final UserDao userDao;

	private final PeopleService peopleService;

	private String authToken;

	private static EmployeeEmploymentBasicDetailsDto getEmployeeEmploymentBasicDetailsDto() {
		EmployeeEmploymentBasicDetailsDto employeeEmploymentBasicDetailsDto = new EmployeeEmploymentBasicDetailsDto();
		employeeEmploymentBasicDetailsDto.setEmail("username9@gmail.com");
		employeeEmploymentBasicDetailsDto.setWorkTimeZone("AST");

		EmployeeEmploymentBasicDetailsManagerDetailsDto employeeEmploymentBasicDetailsPrimaryManagerDetailsDto = new EmployeeEmploymentBasicDetailsManagerDetailsDto();
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setEmployeeId(1L);
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setFirstName("Primary Manager Name 1");
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setLastName("Primary Manager Name 2");

		EmployeeEmploymentBasicDetailsManagerDetailsDto employeeEmploymentBasicDetailsSecondaryManagerDetailsDto = new EmployeeEmploymentBasicDetailsManagerDetailsDto();
		employeeEmploymentBasicDetailsSecondaryManagerDetailsDto.setEmployeeId(2L);
		employeeEmploymentBasicDetailsSecondaryManagerDetailsDto.setFirstName("Secondary Manager Name 1");
		employeeEmploymentBasicDetailsSecondaryManagerDetailsDto.setLastName("Secondary Manager Name 2");

		employeeEmploymentBasicDetailsDto.setPrimarySupervisor(employeeEmploymentBasicDetailsPrimaryManagerDetailsDto);
		List<EmployeeEmploymentBasicDetailsManagerDetailsDto> otherSupervisorsList = new ArrayList<>();
		otherSupervisorsList.add(employeeEmploymentBasicDetailsSecondaryManagerDetailsDto);
		employeeEmploymentBasicDetailsDto.setOtherSupervisors(otherSupervisorsList);

		Long[] teamIds = { 1L };
		employeeEmploymentBasicDetailsDto.setTeamIds(teamIds);

		employeeEmploymentBasicDetailsDto.setJoinedDate(
				DateTimeUtils.getUtcLocalDate(DateTimeUtils.currentDateAt(ZoneOffset.UTC).getYear() - 1, 1, 1));
		employeeEmploymentBasicDetailsDto.setProbationStartDate(
				DateTimeUtils.getUtcLocalDate(DateTimeUtils.currentDateAt(ZoneOffset.UTC).getYear() - 1, 2, 1));
		employeeEmploymentBasicDetailsDto.setProbationEndDate(
				DateTimeUtils.getUtcLocalDate(DateTimeUtils.currentDateAt(ZoneOffset.UTC).getYear() - 1, 4, 1));

		employeeEmploymentBasicDetailsDto.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);
		return employeeEmploymentBasicDetailsDto;
	}

	private static EmployeeEmploymentBasicDetailsDto getEmploymentBasicDetailsDto() {
		EmployeeEmploymentBasicDetailsDto employeeEmploymentBasicDetailsDto = new EmployeeEmploymentBasicDetailsDto();
		employeeEmploymentBasicDetailsDto.setEmail("username20@gmail.com");

		EmployeeEmploymentBasicDetailsManagerDetailsDto employeeEmploymentBasicDetailsPrimaryManagerDetailsDto = new EmployeeEmploymentBasicDetailsManagerDetailsDto();
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setEmployeeId(25L);
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setFirstName("Primary Manager Name 1");
		employeeEmploymentBasicDetailsPrimaryManagerDetailsDto.setLastName("Primary Manager Name 2");
		employeeEmploymentBasicDetailsDto.setPrimarySupervisor(employeeEmploymentBasicDetailsPrimaryManagerDetailsDto);
		return employeeEmploymentBasicDetailsDto;
	}

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post("/v1/people/employee").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(T content) throws Exception {
		return performRequest(patch("/v1/people/employee/100").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CreateEmployeeRequestDto createEmployeeDetails() {
		CreateEmployeeRequestDto createEmployeeRequestDto = new CreateEmployeeRequestDto();

		EmployeePersonalDetailsDto employeePersonalDetailsDto = new EmployeePersonalDetailsDto();
		EmployeePersonalGeneralDetailsDto employeePersonalGeneralDetailsDto = new EmployeePersonalGeneralDetailsDto();
		employeePersonalGeneralDetailsDto.setFirstName("Employee");
		employeePersonalGeneralDetailsDto.setLastName("Lastname");
		employeePersonalGeneralDetailsDto.setMiddleName("MiddleName");
		employeePersonalGeneralDetailsDto.setNin("P74");
		employeePersonalGeneralDetailsDto.setGender(Gender.MALE);

		EmployeePersonalContactDetailsDto employeePersonalContactDetailsDto = new EmployeePersonalContactDetailsDto();
		employeePersonalContactDetailsDto.setPersonalEmail("employee5@gmail.com");
		employeePersonalContactDetailsDto.setContactNo("0773696445");
		employeePersonalContactDetailsDto.setAddressLine1("Address line 1");
		employeePersonalContactDetailsDto.setAddressLine2("Address line 2");
		employeePersonalContactDetailsDto.setCountry("USA");

		employeePersonalDetailsDto.setGeneral(employeePersonalGeneralDetailsDto);
		employeePersonalDetailsDto.setContact(employeePersonalContactDetailsDto);

		EmployeeEmploymentDetailsDto employeeEmploymentDetailsDto = new EmployeeEmploymentDetailsDto();
		EmployeeEmploymentBasicDetailsDto employeeEmploymentBasicDetailsDto = getEmployeeEmploymentBasicDetailsDto();

		EmployeeEmploymentIdentificationAndDiversityDetailsDto employeeEmploymentIdentificationAndDiversityDetailsDto = new EmployeeEmploymentIdentificationAndDiversityDetailsDto();
		employeeEmploymentIdentificationAndDiversityDetailsDto.setEeoJobCategory(EEO.PROFESSIONALS);

		employeeEmploymentDetailsDto.setEmploymentDetails(employeeEmploymentBasicDetailsDto);
		employeeEmploymentDetailsDto
			.setIdentificationAndDiversityDetails(employeeEmploymentIdentificationAndDiversityDetailsDto);

		EmployeeSystemPermissionsDto employeeSystemPermissionsDto = new EmployeeSystemPermissionsDto();
		employeeSystemPermissionsDto.setEsignRole(Role.ESIGN_EMPLOYEE);
		employeeSystemPermissionsDto.setLeaveRole(Role.LEAVE_EMPLOYEE);
		employeeSystemPermissionsDto.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
		employeeSystemPermissionsDto.setPeopleRole(Role.PEOPLE_EMPLOYEE);
		employeeSystemPermissionsDto.setInvoiceRole(Role.INVOICE_NONE);
		employeeSystemPermissionsDto.setIsSuperAdmin(false);

		EmployeeCommonDetailsDto employeeCommonDetailsDto = new EmployeeCommonDetailsDto();
		employeeCommonDetailsDto.setAccountStatus(AccountStatus.ACTIVE);
		employeeCommonDetailsDto.setJobTitle("Software Engineer");

		createEmployeeRequestDto.setPersonal(employeePersonalDetailsDto);
		createEmployeeRequestDto.setEmployment(employeeEmploymentDetailsDto);
		createEmployeeRequestDto.setCommon(employeeCommonDetailsDto);
		createEmployeeRequestDto.setSystemPermissions(employeeSystemPermissionsDto);

		return createEmployeeRequestDto;
	}

	@Nested
	@DisplayName("Employee Creation Tests")
	class EmployeeCreationTests {

		@Test
		@DisplayName("Add employee with invalid managers - Returns Not Found")
		void addEmployee_WithInvalidManagers_ReturnsEntityNotFound() throws Exception {
			CreateEmployeeRequestDto createEmployeeRequestDto = createEmployeeDetails();

			EmployeeEmploymentDetailsDto employeeEmploymentDetailsDto = new EmployeeEmploymentDetailsDto();
			EmployeeEmploymentBasicDetailsDto employeeEmploymentBasicDetailsDto = getEmploymentBasicDetailsDto();
			employeeEmploymentDetailsDto.setEmploymentDetails(employeeEmploymentBasicDetailsDto);

			createEmployeeRequestDto.setEmployment(employeeEmploymentDetailsDto);

			performPostRequest(createEmployeeRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PRIMARY_SUPERVISOR_EMPLOYEE_NOT_FOUND)));
		}

		@Test
		@DisplayName("Add employee with invalid last name - Returns Bad Request")
		void addEmployee_WithInvalidLastName_ReturnsBadRequest() throws Exception {

			CreateEmployeeRequestDto createEmployeeRequestDto = createEmployeeDetails();
			createEmployeeRequestDto.getEmployment().getEmploymentDetails().setEmail("lastname-test@gmail.com");
			EmployeePersonalDetailsDto employeePersonalDetailsDto = new EmployeePersonalDetailsDto();

			EmployeePersonalGeneralDetailsDto employeePersonalGeneralDetailsDto = new EmployeePersonalGeneralDetailsDto();
			employeePersonalGeneralDetailsDto.setFirstName("first name");
			employeePersonalGeneralDetailsDto
				.setLastName("this is a very long last name that exceeds the maximum allowed length");

			employeePersonalDetailsDto.setGeneral(employeePersonalGeneralDetailsDto);
			createEmployeeRequestDto.setPersonal(employeePersonalDetailsDto);

			performPostRequest(createEmployeeRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_LAST_NAME_LENGTH,
							new Object[] { PeopleConstants.MAX_NAME_LENGTH })));
		}

		@Test
		@DisplayName("Add employee with invalid first name - Returns Bad Request")
		void addEmployee_WithInvalidFirstName_ReturnsBadRequest() throws Exception {
			CreateEmployeeRequestDto createEmployeeRequestDto = createEmployeeDetails();
			createEmployeeRequestDto.getEmployment().getEmploymentDetails().setEmail("firstname-test@gmail.com");
			EmployeePersonalDetailsDto employeePersonalDetailsDto = new EmployeePersonalDetailsDto();

			EmployeePersonalGeneralDetailsDto employeePersonalGeneralDetailsDto = new EmployeePersonalGeneralDetailsDto();
			employeePersonalGeneralDetailsDto
				.setFirstName("this is a very long first name that exceeds the maximum allowed length");
			employeePersonalGeneralDetailsDto.setLastName("last name");

			employeePersonalDetailsDto.setGeneral(employeePersonalGeneralDetailsDto);
			createEmployeeRequestDto.setPersonal(employeePersonalDetailsDto);

			performPostRequest(createEmployeeRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_FIRST_NAME_LENGTH,
							new Object[] { PeopleConstants.MAX_NAME_LENGTH })));
		}

	}

	@Nested
	@DisplayName("Reactivate Terminated User Tests")
	class ReactivateTerminatedUserTests {

		@Test
		@DisplayName("Reactivate a terminated user - Returns Success")
		void reactivateTerminatedUser_WithValidTerminatedUser_ReturnsSuccess() throws Exception {
			// Terminate user2 first to set up the prerequisite state
			performRequest(patch("/v1/people/user/terminate/2").contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk());

			performRequest(patch("/v1/people/user/reactivate/2").contentType(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
		}

		@Test
		@DisplayName("Reactivate an active (non-terminated) user - Returns Bad Request")
		void reactivateTerminatedUser_WithActiveUser_ReturnsBadRequest() throws Exception {
			performRequest(patch("/v1/people/user/reactivate/2").contentType(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_TERMINATED)));
		}

		@Test
		@DisplayName("Reactivate with non-existent user ID - Returns Not Found")
		void reactivateTerminatedUser_WithNonExistentId_ReturnsNotFound() throws Exception {
			performRequest(patch("/v1/people/user/reactivate/99999").contentType(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND)));
		}

	}

	@Nested
	@DisplayName("Employee Update Tests")
	class EmployeeUpdateTests {

		@Test
		@DisplayName("Update non-existent employee - Returns Not Found")
		void updateEmployee_WithNonExistentUser_ReturnsNotFound() throws Exception {
			EmployeeUpdateDto updateDto = new EmployeeUpdateDto();
			updateDto.setFirstName("newName");

			performPatchRequest(updateDto).andDo(print())
				.andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND)));
		}

	}

	@Nested
	@DisplayName("Employee Update Access Tests")
	class EmployeeUpdateAccessTests {

		private static final Long EMPLOYEE_ID = 2L;

		private static final Long MANAGER_ID = 3L;

		private static final Long PEOPLE_ADMIN_ID = 4L;

		private static final String SELF_WORK_TIME_ZONE = "Asia/Colombo";

		private static final String ESIGN_PHONE = "+94771234567";

		private String employeeToken;

		private String managerToken;

		private String peopleAdminToken;

		@BeforeEach
		void setupRoles() {
			EmployeeRole employeeRole = employeeDao.findById(EMPLOYEE_ID).orElseThrow().getEmployeeRole();
			employeeRole.setPeopleRole(Role.PEOPLE_EMPLOYEE);
			employeeRole.setLeaveRole(Role.LEAVE_EMPLOYEE);
			employeeRole.setIsSuperAdmin(false);
			EmployeeRole managerRole = employeeDao.findById(MANAGER_ID).orElseThrow().getEmployeeRole();
			managerRole.setPeopleRole(Role.PEOPLE_MANAGER);
			managerRole.setLeaveRole(Role.LEAVE_EMPLOYEE);
			managerRole.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
			managerRole.setIsSuperAdmin(false);
			EmployeeRole peopleAdminRole = employeeDao.findById(PEOPLE_ADMIN_ID).orElseThrow().getEmployeeRole();
			peopleAdminRole.setPeopleRole(Role.PEOPLE_ADMIN);
			peopleAdminRole.setIsSuperAdmin(false);
			employeeRoleDao.flush();

			employeeToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
					EMPLOYEE_ID);
			managerToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"),
					MANAGER_ID);
			peopleAdminToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user4@gmail.com"),
					PEOPLE_ADMIN_ID);
		}

		private ResultActions patchEmployee(String token, String path, Object content) throws Exception {
			return mvc.perform(patch(path).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(content))
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(token)));
		}

		private void expectForbidden(ResultActions resultActions) throws Exception {
			resultActions.andDo(print())
				.andExpect(status().isForbidden())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED)));
		}

		private void expectOk(ResultActions resultActions) throws Exception {
			resultActions.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
		}

		private CreateEmployeeRequestDto lastNameRequest(String lastName) {
			EmployeePersonalGeneralDetailsDto general = new EmployeePersonalGeneralDetailsDto();
			general.setLastName(lastName);
			EmployeePersonalDetailsDto personal = new EmployeePersonalDetailsDto();
			personal.setGeneral(general);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setPersonal(personal);
			return request;
		}

		private CreateEmployeeRequestDto superAdminRequest() {
			EmployeeSystemPermissionsDto systemPermissions = new EmployeeSystemPermissionsDto();
			systemPermissions.setIsSuperAdmin(true);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setSystemPermissions(systemPermissions);
			return request;
		}

		private CreateEmployeeRequestDto emailRequest(String email) {
			EmployeeEmploymentBasicDetailsDto employmentDetails = new EmployeeEmploymentBasicDetailsDto();
			employmentDetails.setEmail(email);
			EmployeeEmploymentDetailsDto employment = new EmployeeEmploymentDetailsDto();
			employment.setEmploymentDetails(employmentDetails);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setEmployment(employment);
			return request;
		}

		private EmployeeJoinedDateRequestDto joinedDateRequest(LocalDate joinedDate) {
			EmployeeJoinedDateRequestDto request = new EmployeeJoinedDateRequestDto();
			request.setJoinedDate(joinedDate);
			return request;
		}

		private String lastNameOf(Long employeeId) {
			return employeeDao.findById(employeeId).orElseThrow().getLastName();
		}

		private Boolean isSuperAdmin(Long employeeId) {
			return employeeDao.findById(employeeId).orElseThrow().getEmployeeRole().getIsSuperAdmin();
		}

		private LocalDate joinDateOf(Long employeeId) {
			return employeeDao.findById(employeeId).orElseThrow().getJoinDate();
		}

		@Test
		@DisplayName("Employee edits another employee - Returns Forbidden and leaves the record unchanged")
		void updateEmployee_ByEmployeeForAnotherEmployee_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + PEOPLE_ADMIN_ID,
					lastNameRequest("IDOR-BY-EMPLOYEE")));

			assertEquals("Lastname Four", lastNameOf(PEOPLE_ADMIN_ID));
		}

		@Test
		@DisplayName("Employee grants super admin to another employee - Returns Forbidden")
		void updateEmployee_ByEmployeeGrantingSuperAdminToAnother_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + MANAGER_ID, superAdminRequest()));

			assertEquals(Boolean.FALSE, isSuperAdmin(MANAGER_ID));
		}

		@Test
		@DisplayName("Employee edits own personal details - Returns OK")
		void updateEmployee_ByEmployeeForOwnPersonalDetails_ReturnsOk() throws Exception {
			expectOk(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID,
					lastNameRequest("Self Updated")));

			assertEquals("Self Updated", lastNameOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Employee changes own email - Returns Forbidden and keeps the email")
		void updateEmployee_ByEmployeeChangingOwnEmail_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID,
					emailRequest("attacker@gmail.com")));

			assertEquals("user2@gmail.com", userDao.findById(EMPLOYEE_ID).orElseThrow().getEmail());
		}

		@Test
		@DisplayName("Employee grants self super admin - Returns Forbidden")
		void updateEmployee_ByEmployeeGrantingSelfSuperAdmin_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, superAdminRequest()));

			assertEquals(Boolean.FALSE, isSuperAdmin(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("People manager edits a report - Returns Forbidden")
		void updateEmployee_ByPeopleManagerForReport_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(managerToken, "/v1/people/employee/" + EMPLOYEE_ID,
					lastNameRequest("EDITED-BY-MANAGER")));

			assertEquals("Lastname Two", lastNameOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("People admin edits another employee - Returns OK")
		void updateEmployee_ByPeopleAdminForAnotherEmployee_ReturnsOk() throws Exception {
			expectOk(patchEmployee(peopleAdminToken, "/v1/people/employee/" + EMPLOYEE_ID,
					lastNameRequest("Admin Updated")));

			assertEquals("Admin Updated", lastNameOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("People admin grants super admin - Returns Forbidden")
		void updateEmployee_ByPeopleAdminGrantingSuperAdmin_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(peopleAdminToken, "/v1/people/employee/" + EMPLOYEE_ID, superAdminRequest()));

			assertEquals(Boolean.FALSE, isSuperAdmin(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Super admin grants super admin - Returns OK")
		void updateEmployee_BySuperAdminGrantingSuperAdmin_ReturnsOk() throws Exception {
			expectOk(patchEmployee(authToken, "/v1/people/employee/" + EMPLOYEE_ID, superAdminRequest()));

			assertEquals(Boolean.TRUE, isSuperAdmin(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Leave admin sets a joined date - Returns OK")
		void updateEmployeeJoinedDate_ByLeaveAdmin_ReturnsOk() throws Exception {
			LocalDate joinedDate = LocalDate.of(2020, 1, 15);
			employeeDao.findById(EMPLOYEE_ID).orElseThrow().setJoinDate(null);
			employeeDao.flush();

			expectOk(patchEmployee(authToken, "/v1/people/employee/" + EMPLOYEE_ID + "/joined-date",
					joinedDateRequest(joinedDate)));

			assertEquals(joinedDate, joinDateOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Employee without leave admin sets a joined date - Returns Forbidden")
		void updateEmployeeJoinedDate_ByEmployee_ReturnsForbidden() throws Exception {
			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + MANAGER_ID + "/joined-date",
					joinedDateRequest(LocalDate.of(2020, 1, 15))));

			assertEquals(LocalDate.of(2021, 8, 1), joinDateOf(MANAGER_ID));
		}

		@Test
		@DisplayName("People admin changes a super admin's work email - Returns Forbidden")
		void updateEmployee_ByPeopleAdminChangingSuperAdminEmail_ReturnsForbidden() throws Exception {
			expectForbidden(
					patchEmployee(peopleAdminToken, "/v1/people/employee/1", emailRequest("takeover@gmail.com")));

			assertEquals("user1@gmail.com", userDao.findById(1L).orElseThrow().getEmail());
		}

		@Test
		@DisplayName("Employee changes own payroll id - Returns Forbidden")
		void updateEmployee_ByEmployeeChangingOwnPayrollId_ReturnsForbidden() throws Exception {
			EmployeeEmploymentIdentificationAndDiversityDetailsDto identification = new EmployeeEmploymentIdentificationAndDiversityDetailsDto();
			identification.setPayrollId("PAY-3436");
			EmployeeEmploymentDetailsDto employment = new EmployeeEmploymentDetailsDto();
			employment.setIdentificationAndDiversityDetails(identification);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setEmployment(employment);

			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, request));

			assertNull(employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPayrollId());
		}

		@Test
		@DisplayName("Employee changes own account status - Returns Forbidden")
		void updateEmployee_ByEmployeeChangingOwnAccountStatus_ReturnsForbidden() throws Exception {
			EmployeeCommonDetailsDto common = new EmployeeCommonDetailsDto();
			common.setAccountStatus(AccountStatus.DEACTIVATED);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setCommon(common);

			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, request));

			assertEquals(AccountStatus.ACTIVE, employeeDao.findById(EMPLOYEE_ID).orElseThrow().getAccountStatus());
		}

		@Test
		@DisplayName("Employee changes own career progression - Returns Forbidden")
		void updateEmployee_ByEmployeeChangingOwnCareerProgression_ReturnsForbidden() throws Exception {
			int progressionCount = progressionCountOf(EMPLOYEE_ID);
			EmployeeEmploymentDetailsDto employment = new EmployeeEmploymentDetailsDto();
			employment.setCareerProgression(List.of(new EmployeeEmploymentCareerProgressionDetailsDto()));
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setEmployment(employment);

			expectForbidden(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, request));

			assertEquals(progressionCount, progressionCountOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Employee edits own SSN - Returns OK")
		void updateEmployee_ByEmployeeEditingOwnSsn_ReturnsOk() throws Exception {
			EmployeeEmploymentIdentificationAndDiversityDetailsDto identification = new EmployeeEmploymentIdentificationAndDiversityDetailsDto();
			identification.setSsn("123-45-6789");
			EmployeeEmploymentDetailsDto employment = new EmployeeEmploymentDetailsDto();
			employment.setIdentificationAndDiversityDetails(identification);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setEmployment(employment);

			expectOk(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, request));

			assertEquals("123-45-6789", employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPersonalInfo().getSsn());
		}

		@Test
		@DisplayName("Leave admin replaces an existing joined date - Returns Bad Request")
		void updateEmployeeJoinedDate_WithExistingJoinedDate_ReturnsBadRequest() throws Exception {
			LocalDate existingJoinDate = joinDateOf(EMPLOYEE_ID);

			patchEmployee(authToken, "/v1/people/employee/" + EMPLOYEE_ID + "/joined-date",
					joinedDateRequest(LocalDate.of(2020, 1, 15)))
				.andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOINED_DATE_ALREADY_SET)));

			assertEquals(existingJoinDate, joinDateOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Employee changes own work time zone - Returns OK")
		void updateEmployee_ByEmployeeChangingOwnWorkTimeZone_ReturnsOk() throws Exception {
			EmployeeEmploymentBasicDetailsDto employmentDetails = new EmployeeEmploymentBasicDetailsDto();
			employmentDetails.setWorkTimeZone(SELF_WORK_TIME_ZONE);
			EmployeeEmploymentDetailsDto employment = new EmployeeEmploymentDetailsDto();
			employment.setEmploymentDetails(employmentDetails);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setEmployment(employment);

			expectOk(patchEmployee(employeeToken, "/v1/people/employee/" + EMPLOYEE_ID, request));

			assertEquals(SELF_WORK_TIME_ZONE, employeeDao.findById(EMPLOYEE_ID).orElseThrow().getTimeZone());
		}

		@Test
		@DisplayName("E-sign contact number is saved for an employee with no phone")
		void updateEmployeeContactNumber_WithNoPhone_SavesPhone() {
			employeeDao.findById(EMPLOYEE_ID).orElseThrow().setPhone(null);
			employeeDao.flush();

			peopleService.updateEmployeeContactNumber(EMPLOYEE_ID, contactNumberRequest(ESIGN_PHONE));

			assertEquals(ESIGN_PHONE, employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPhone());
		}

		@Test
		@DisplayName("E-sign contact number never replaces an existing phone")
		void updateEmployeeContactNumber_WithExistingPhone_ThrowsAndKeepsPhone() {
			String existingPhone = employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPhone();
			EmployeeContactNumberRequestDto request = contactNumberRequest(ESIGN_PHONE);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> peopleService.updateEmployeeContactNumber(EMPLOYEE_ID, request));

			assertEquals(PeopleMessageConstant.PEOPLE_ERROR_CONTACT_NUMBER_ALREADY_SET, exception.getMessageKey());
			assertEquals(existingPhone, employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPhone());
		}

		@Test
		@DisplayName("Leave admin sets a future joined date - Returns Unprocessable")
		void updateEmployeeJoinedDate_WithFutureDate_IsRefused() throws Exception {
			employeeDao.findById(EMPLOYEE_ID).orElseThrow().setJoinDate(null);
			employeeDao.flush();

			patchEmployee(authToken, "/v1/people/employee/" + EMPLOYEE_ID + "/joined-date",
					joinedDateRequest(DateTimeUtils.currentDateAt(ZoneOffset.UTC).plusYears(1)))
				.andDo(print())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYMENT_JOINED_DATE_FUTURE_DATE)));

			assertNull(joinDateOf(EMPLOYEE_ID));
		}

		@Test
		@DisplayName("Leave admin sets no joined date - Returns the required error")
		void updateEmployeeJoinedDate_WithoutDate_IsRefused() throws Exception {
			patchEmployee(authToken, "/v1/people/employee/" + EMPLOYEE_ID + "/joined-date", joinedDateRequest(null))
				.andDo(print())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOINED_DATE_REQUIRED)));
		}

		@Test
		@DisplayName("Leave admin sets a joined date for an unknown employee - Returns Not Found")
		void updateEmployeeJoinedDate_ForUnknownEmployee_ReturnsNotFound() throws Exception {
			patchEmployee(authToken, "/v1/people/employee/99999/joined-date",
					joinedDateRequest(LocalDate.of(2020, 1, 15)))
				.andDo(print())
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("People admin edits a super admin's name - Returns OK")
		void updateEmployee_ByPeopleAdminEditingSuperAdminName_ReturnsOk() throws Exception {
			expectOk(patchEmployee(peopleAdminToken, "/v1/people/employee/1", lastNameRequest("Owner Renamed")));

			assertEquals("Owner Renamed", lastNameOf(1L));
		}

		@Test
		@DisplayName("People admin revokes super admin - Returns Forbidden")
		void updateEmployee_ByPeopleAdminRevokingSuperAdmin_ReturnsForbidden() throws Exception {
			EmployeeSystemPermissionsDto systemPermissions = new EmployeeSystemPermissionsDto();
			systemPermissions.setIsSuperAdmin(false);
			CreateEmployeeRequestDto request = new CreateEmployeeRequestDto();
			request.setSystemPermissions(systemPermissions);

			expectForbidden(patchEmployee(peopleAdminToken, "/v1/people/employee/1", request));

			assertEquals(Boolean.TRUE, isSuperAdmin(1L));
		}

		@Test
		@DisplayName("People admin creates a super admin - Returns Forbidden")
		void createEmployee_ByPeopleAdminAsSuperAdmin_ReturnsForbidden() throws Exception {
			CreateEmployeeRequestDto request = createEmployeeDetails();
			request.getEmployment().getEmploymentDetails().setEmail("new-super-admin@gmail.com");
			request.getSystemPermissions().setIsSuperAdmin(true);

			expectForbidden(mvc.perform(post("/v1/people/employee").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request))
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(peopleAdminToken))));

			assertTrue(userDao.findByEmail("new-super-admin@gmail.com").isEmpty());
		}

		@Test
		@DisplayName("E-sign contact number with no number - Throws the required error")
		void updateEmployeeContactNumber_WithBlankNumber_Throws() {
			EmployeeContactNumberRequestDto request = contactNumberRequest(" ");

			ValidationException exception = assertThrows(ValidationException.class,
					() -> peopleService.updateEmployeeContactNumber(EMPLOYEE_ID, request));

			assertEquals(PeopleMessageConstant.PEOPLE_ERROR_CONTACT_NUMBER_REQUIRED, exception.getMessageKey());
		}

		@Test
		@DisplayName("E-sign contact number for a deactivated employee - Throws and saves nothing")
		void updateEmployeeContactNumber_ForDeactivatedEmployee_Throws() {
			Employee employee = employeeDao.findById(EMPLOYEE_ID).orElseThrow();
			employee.setPhone(null);
			employee.setAccountStatus(AccountStatus.DEACTIVATED);
			employeeDao.flush();
			EmployeeContactNumberRequestDto request = contactNumberRequest(ESIGN_PHONE);

			ModuleException exception = assertThrows(ModuleException.class,
					() -> peopleService.updateEmployeeContactNumber(EMPLOYEE_ID, request));

			assertEquals(PeopleMessageConstant.PEOPLE_ERROR_CONTACT_NUMBER_TARGET_NOT_ACTIVE,
					exception.getMessageKey());
			assertNull(employeeDao.findById(EMPLOYEE_ID).orElseThrow().getPhone());
		}

		private int progressionCountOf(Long employeeId) {
			return employeeDao.findById(employeeId).orElseThrow().getEmployeeProgressions().size();
		}

		private EmployeeContactNumberRequestDto contactNumberRequest(String contactNo) {
			EmployeeContactNumberRequestDto request = new EmployeeContactNumberRequestDto();
			request.setContactNo(contactNo);
			return request;
		}

	}

}
