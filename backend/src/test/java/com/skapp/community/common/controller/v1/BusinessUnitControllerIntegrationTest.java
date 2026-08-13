package com.skapp.community.common.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.model.BusinessUnit;
import com.skapp.community.common.payload.request.BusinessUnitRequestDto;
import com.skapp.community.common.repository.BusinessUnitDao;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
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

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Business Unit Controller Integration Tests")
class BusinessUnitControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/com/business-unit";

	/**
	 * Seeded via {@code data.sql}; employee_id mirrors user_id, so user1 -> employee 1.
	 */
	private static final Long SEEDED_EMPLOYEE_ID = 1L;

	private final AuthorityService authorityService;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final BusinessUnitDao businessUnitDao;

	private final EmployeeDao employeeDao;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdmin());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private BusinessUnit seedBusinessUnit(String name) {
		BusinessUnit businessUnit = new BusinessUnit();
		businessUnit.setName(name);
		return businessUnitDao.saveAndFlush(businessUnit);
	}

	private void assignSeededEmployeeTo(BusinessUnit businessUnit) {
		Employee employee = employeeDao.findById(SEEDED_EMPLOYEE_ID).orElseThrow();
		employee.setBusinessUnit(businessUnit);
		employeeDao.saveAndFlush(employee);
	}

	private BusinessUnit businessUnitOfSeededEmployee() {
		return employeeDao.findById(SEEDED_EMPLOYEE_ID).orElseThrow().getBusinessUnit();
	}

	@Nested
	@DisplayName("Create Business Unit")
	class CreateBusinessUnit {

		@Test
		@DisplayName("Create business unit with valid name - Returns Created")
		void createBusinessUnit_withValidName_ReturnsCreated() throws Exception {
			BusinessUnitRequestDto request = new BusinessUnitRequestDto();
			request.setName("Engineering");
			request.setDescription("Product engineering");

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request))
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Engineering"));
		}

		@Test
		@DisplayName("Create business unit with blank name - Returns Bad Request")
		void createBusinessUnit_withBlankName_ReturnsBadRequest() throws Exception {
			BusinessUnitRequestDto request = new BusinessUnitRequestDto();
			request.setName("  ");

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request))
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_REQUIRED)));
		}

		@Test
		@DisplayName("Create business unit with duplicate name - Returns Bad Request")
		void createBusinessUnit_withDuplicateName_ReturnsBadRequest() throws Exception {
			seedBusinessUnit("Finance");

			BusinessUnitRequestDto request = new BusinessUnitRequestDto();
			request.setName("Finance");

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request))
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(
						messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_ALREADY_EXISTS)));
		}

	}

	@Nested
	@DisplayName("Read Business Units")
	class ReadBusinessUnits {

		@Test
		@DisplayName("Get all business units - Returns OK sorted by name")
		void getAllBusinessUnits_ReturnsOkSortedByName() throws Exception {
			seedBusinessUnit("Zeta");
			seedBusinessUnit("Alpha");

			performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Alpha"));
		}

		@Test
		@DisplayName("Get business unit summary - Returns assigned count and other-units flag")
		void getBusinessUnitSummary_ReturnsSummary() throws Exception {
			BusinessUnit target = seedBusinessUnit("Sales");
			seedBusinessUnit("Marketing");
			assignSeededEmployeeTo(target);

			performRequest(get(BASE_PATH + "/{id}/business-unit-summary", target.getBusinessUnitId())
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['assignedEmployeeCount']").value(1))
				.andExpect(jsonPath(RESULTS_0_PATH + "['isOtherBusinessUnitsExist']").value(true));
		}

	}

	@Nested
	@DisplayName("Update Business Unit")
	class UpdateBusinessUnit {

		@Test
		@DisplayName("Update existing business unit - Returns OK")
		void updateBusinessUnit_existing_ReturnsOk() throws Exception {
			BusinessUnit businessUnit = seedBusinessUnit("Ops");

			BusinessUnitRequestDto request = new BusinessUnitRequestDto();
			request.setName("Operations");

			performRequest(
					patch(BASE_PATH + "/{id}", businessUnit.getBusinessUnitId()).contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(request))
						.accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Operations"));
		}

		@Test
		@DisplayName("Update non-existent business unit - Returns Bad Request")
		void updateBusinessUnit_nonExistent_ReturnsBadRequest() throws Exception {
			BusinessUnitRequestDto request = new BusinessUnitRequestDto();
			request.setName("Ghost");

			performRequest(patch(BASE_PATH + "/{id}", 999999L).contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request))
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NOT_FOUND)));
		}

	}

	@Nested
	@DisplayName("Delete Business Unit")
	class DeleteBusinessUnit {

		@Test
		@DisplayName("Delete with transfer target - Reassigns employees and deletes unit")
		void deleteBusinessUnit_withTransferTarget_ReassignsEmployeesAndDeletes() throws Exception {
			BusinessUnit unitToDelete = seedBusinessUnit("Legacy");
			BusinessUnit transferTarget = seedBusinessUnit("Modern");
			assignSeededEmployeeTo(unitToDelete);

			performRequest(delete(BASE_PATH + "/{id}", unitToDelete.getBusinessUnitId())
				.param("transferToBusinessUnitId", String.valueOf(transferTarget.getBusinessUnitId()))
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

			assertThat(businessUnitDao.findById(unitToDelete.getBusinessUnitId())).isEmpty();
			BusinessUnit reassigned = businessUnitOfSeededEmployee();
			assertThat(reassigned).isNotNull();
			assertThat(reassigned.getBusinessUnitId()).isEqualTo(transferTarget.getBusinessUnitId());
		}

		@Test
		@DisplayName("Delete without transfer target - Unassigns employees and deletes unit")
		void deleteBusinessUnit_withoutTransferTarget_UnassignsEmployeesAndDeletes() throws Exception {
			BusinessUnit unitToDelete = seedBusinessUnit("Standalone");
			assignSeededEmployeeTo(unitToDelete);

			performRequest(
					delete(BASE_PATH + "/{id}", unitToDelete.getBusinessUnitId()).accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

			assertThat(businessUnitDao.findById(unitToDelete.getBusinessUnitId())).isEmpty();
			assertThat(businessUnitOfSeededEmployee()).isNull();
		}

		@Test
		@DisplayName("Delete with no employees assigned - Returns OK")
		void deleteBusinessUnit_withNoEmployeesAssigned_ReturnsOk() throws Exception {
			BusinessUnit unitToDelete = seedBusinessUnit("Empty");

			performRequest(
					delete(BASE_PATH + "/{id}", unitToDelete.getBusinessUnitId()).accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

			assertThat(businessUnitDao.findById(unitToDelete.getBusinessUnitId())).isEmpty();
		}

		@Test
		@DisplayName("Delete with missing transfer target - Returns Bad Request and keeps unit")
		void deleteBusinessUnit_withMissingTransferTarget_ReturnsBadRequest() throws Exception {
			BusinessUnit unitToDelete = seedBusinessUnit("Kept");
			assignSeededEmployeeTo(unitToDelete);

			performRequest(delete(BASE_PATH + "/{id}", unitToDelete.getBusinessUnitId())
				.param("transferToBusinessUnitId", "999999")
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(messageUtil
					.getMessage(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_TRANSFER_TARGET_NOT_FOUND)));

			assertThat(businessUnitDao.findById(unitToDelete.getBusinessUnitId())).isPresent();
		}

		@Test
		@DisplayName("Delete non-existent business unit - Returns Bad Request")
		void deleteBusinessUnit_nonExistentUnit_ReturnsBadRequest() throws Exception {
			performRequest(delete(BASE_PATH + "/{id}", 999999L).accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NOT_FOUND)));
		}

	}

}
