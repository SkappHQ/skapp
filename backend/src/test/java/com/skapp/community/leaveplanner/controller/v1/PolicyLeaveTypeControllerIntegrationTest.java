package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.hasSize;
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
@DisplayName("Policy Leave Type Controller Integration Tests")
class PolicyLeaveTypeControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policy-leave-types";

	private static final String SEARCH_ENDPOINT = ENDPOINT + "/search";

	private static final String INSERT_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) VALUES ";

	private static final String SEED_LEAVE_TYPE = INSERT_LEAVE_TYPE
			+ "(100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_INACTIVE_LEAVE_TYPE = INSERT_LEAVE_TYPE
			+ "(101, 'PolicyInactive', 'U+1F912', '#F44336', 'HALF_DAY', false, false, false, false, false)";

	private static final String SEED_SECOND_LEAVE_TYPE = INSERT_LEAVE_TYPE
			+ "(102, 'PolicySick', 'U+1F915', '#4CAF50', 'FULL_DAY', false, false, false, false, true)";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String VALID_LEAVE_TYPE_JSON = """
			{
			  "name": "Casual Leave",
			  "emojiCode": "U+1F3D6",
			  "colorCode": "#FFC107",
			  "minDuration": "HALF_DAY",
			  "isAttachment": true,
			  "isAttachmentMust": true,
			  "isCommentMust": true,
			  "isAutoApproval": false
			}
			""";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String leaveAdminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private String user2Token() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

	private ResultActions performCreate(String authToken, String body) throws Exception {
		return mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetAll(String authToken) throws Exception {
		return mvc
			.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetById(String authToken, long id) throws Exception {
		return mvc.perform(get(ENDPOINT + "/" + id).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performUpdate(String authToken, long id, String body) throws Exception {
		return mvc.perform(patch(ENDPOINT + "/" + id).contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performDeactivate(String authToken, long id) throws Exception {
		return mvc.perform(patch(ENDPOINT + "/" + id + "/deactivate").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performActivate(String authToken, long id) throws Exception {
		return mvc.perform(patch(ENDPOINT + "/" + id + "/activate").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("List Policy Leave Types")
	class ListPolicyLeaveTypesTests {

		@Test
		@DisplayName("Leave admin can list active policy leave types")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void getPolicyLeaveTypes_LeaveAdmin_ReturnsActiveTypes() throws Exception {
			performGetAll(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results", hasSize(1)))
				.andExpect(jsonPath("$.results[0].leaveTypes", hasSize(1)))
				.andExpect(jsonPath("$.results[0].leaveTypes[0].name").value("PolicyAnnual"));
		}

		@Test
		@DisplayName("Inactive leave types are excluded from the active list")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE })
		void getPolicyLeaveTypes_InactiveType_IsExcluded() throws Exception {
			performGetAll(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].leaveTypes", hasSize(1)))
				.andExpect(jsonPath("$.results[0].leaveTypes[0].name").value("PolicyAnnual"));
		}

	}

	@Nested
	@DisplayName("Create Policy Leave Type")
	class CreatePolicyLeaveTypeTests {

		@Test
		@DisplayName("Leave admin can create a policy leave type")
		void addPolicyLeaveType_LeaveAdmin_ReturnsCreated() throws Exception {
			performCreate(leaveAdminToken(), VALID_LEAVE_TYPE_JSON).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].name").value("Casual Leave"))
				.andExpect(jsonPath("$.results[0].emojiCode").value("U+1F3D6"))
				.andExpect(jsonPath("$.results[0].colorCode").value("#FFC107"))
				.andExpect(jsonPath("$.results[0].minDuration").value("HALF_DAY"))
				.andExpect(jsonPath("$.results[0].isAttachment").value(true))
				.andExpect(jsonPath("$.results[0].isAttachmentMust").value(true))
				.andExpect(jsonPath("$.results[0].isCommentMust").value(true))
				.andExpect(jsonPath("$.results[0].isAutoApproval").value(false))
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Omitted boolean flags default to false and the type is created active")
		void addPolicyLeaveType_OmittedFlags_DefaultsToFalse() throws Exception {
			String minimal = """
					{
					  "name": "Minimal Leave",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), minimal).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.results[0].isAttachment").value(false))
				.andExpect(jsonPath("$.results[0].isAttachmentMust").value(false))
				.andExpect(jsonPath("$.results[0].isCommentMust").value(false))
				.andExpect(jsonPath("$.results[0].isAutoApproval").value(false))
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Returns bad request when a leave type with the same name exists in a different case")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void addPolicyLeaveType_DuplicateNameDifferentCase_ReturnsBadRequest() throws Exception {
			String duplicate = """
					{
					  "name": "policyannual",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), duplicate).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the name is missing")
		void addPolicyLeaveType_MissingName_ReturnsBadRequest() throws Exception {
			String missingName = """
					{
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), missingName).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the name is blank")
		void addPolicyLeaveType_BlankName_ReturnsBadRequest() throws Exception {
			String blankName = """
					{
					  "name": "   ",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), blankName).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the name exceeds the maximum length")
		void addPolicyLeaveType_NameExceedsMaxLength_ReturnsBadRequest() throws Exception {
			String tooLongName = """
					{
					  "name": "%s",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""".formatted("A".repeat(101));

			performCreate(leaveAdminToken(), tooLongName).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the emoji code is missing")
		void addPolicyLeaveType_MissingEmojiCode_ReturnsBadRequest() throws Exception {
			String missingEmoji = """
					{
					  "name": "No Emoji Leave",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), missingEmoji).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the color code is missing")
		void addPolicyLeaveType_MissingColorCode_ReturnsBadRequest() throws Exception {
			String missingColor = """
					{
					  "name": "No Color Leave",
					  "emojiCode": "U+1F3D6",
					  "minDuration": "FULL_DAY"
					}
					""";

			performCreate(leaveAdminToken(), missingColor).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the minimum duration is missing")
		void addPolicyLeaveType_MissingMinDuration_ReturnsBadRequest() throws Exception {
			String missingDuration = """
					{
					  "name": "No Duration Leave",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107"
					}
					""";

			performCreate(leaveAdminToken(), missingDuration).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when an attachment is mandatory but attachments are disabled")
		void addPolicyLeaveType_AttachmentMustWithoutAttachment_ReturnsBadRequest() throws Exception {
			String invalidAttachmentSetup = """
					{
					  "name": "Bad Attachment Leave",
					  "emojiCode": "U+1F3D6",
					  "colorCode": "#FFC107",
					  "minDuration": "FULL_DAY",
					  "isAttachment": false,
					  "isAttachmentMust": true
					}
					""";

			performCreate(leaveAdminToken(), invalidAttachmentSetup).andDo(print()).andExpect(status().isBadRequest());
		}

	}

	@Nested
	@DisplayName("Search Policy Leave Types")
	class SearchPolicyLeaveTypesTests {

		private ResultActions performSearch(String authToken, String paramName, String paramValue) throws Exception {
			return mvc.perform(get(SEARCH_ENDPOINT).accept(MediaType.APPLICATION_JSON)
				.param(paramName, paramValue)
				.with(SecurityTestUtils.bearerToken(authToken)));
		}

		@Test
		@DisplayName("Leave admin can search leave types regardless of active status")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_LeaveAdmin_ReturnsAllTypes() throws Exception {
			mvc.perform(get(SEARCH_ENDPOINT).accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].items", hasSize(3)))
				.andExpect(jsonPath("$.results[0].totalItems").value(3))
				.andExpect(jsonPath("$.results[0].currentPage").value(0))
				.andExpect(jsonPath("$.results[0].totalPages").value(1));
		}

		@Test
		@DisplayName("Results are ordered by name ascending")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_OrdersByNameAscending() throws Exception {
			mvc.perform(get(SEARCH_ENDPOINT).accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items[0].name").value("PolicyAnnual"))
				.andExpect(jsonPath("$.results[0].items[1].name").value("PolicyInactive"))
				.andExpect(jsonPath("$.results[0].items[2].name").value("PolicySick"));
		}

		@Test
		@DisplayName("Active filter returns only active leave types")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_IsActiveTrue_ReturnsOnlyActive() throws Exception {
			performSearch(leaveAdminToken(), "isActive", "true").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(2)))
				.andExpect(jsonPath("$.results[0].totalItems").value(2));
		}

		@Test
		@DisplayName("Inactive filter returns only inactive leave types")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_IsActiveFalse_ReturnsOnlyInactive() throws Exception {
			performSearch(leaveAdminToken(), "isActive", "false").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].name").value("PolicyInactive"));
		}

		@Test
		@DisplayName("Search keyword matches leave type names case insensitively")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_SearchKeyword_IsCaseInsensitive() throws Exception {
			performSearch(leaveAdminToken(), "searchKeyword", "SICK").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].name").value("PolicySick"));
		}

		@Test
		@DisplayName("Search keyword returns an empty page when nothing matches")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_NoMatches_ReturnsEmptyPage() throws Exception {
			performSearch(leaveAdminToken(), "searchKeyword", "NoSuchLeaveType").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(0)))
				.andExpect(jsonPath("$.results[0].totalItems").value(0));
		}

		@Test
		@DisplayName("Page size is respected and total pages are calculated")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void searchPolicyLeaveTypes_PageSize_LimitsResults() throws Exception {
			mvc.perform(get(SEARCH_ENDPOINT).accept(MediaType.APPLICATION_JSON)
				.param("page", "0")
				.param("size", "2")
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(2)))
				.andExpect(jsonPath("$.results[0].totalItems").value(3))
				.andExpect(jsonPath("$.results[0].totalPages").value(2));
		}

	}

	@Nested
	@DisplayName("Get Policy Leave Type By Id")
	class GetPolicyLeaveTypeByIdTests {

		@Test
		@DisplayName("Leave admin can get a leave type by id")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void getPolicyLeaveTypeById_LeaveAdmin_ReturnsLeaveType() throws Exception {
			performGetById(leaveAdminToken(), 100).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].id").value(100))
				.andExpect(jsonPath("$.results[0].name").value("PolicyAnnual"))
				.andExpect(jsonPath("$.results[0].minDuration").value("FULL_DAY"))
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Leave admin can get an inactive leave type by id")
		@Sql(statements = { SEED_INACTIVE_LEAVE_TYPE })
		void getPolicyLeaveTypeById_InactiveLeaveType_ReturnsLeaveType() throws Exception {
			performGetById(leaveAdminToken(), 101).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].name").value("PolicyInactive"))
				.andExpect(jsonPath("$.results[0].isActive").value(false));
		}

		@Test
		@DisplayName("Returns not found when the leave type does not exist")
		void getPolicyLeaveTypeById_UnknownId_ReturnsNotFound() throws Exception {
			performGetById(leaveAdminToken(), 9999).andDo(print()).andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Update Policy Leave Type")
	class UpdatePolicyLeaveTypeTests {

		@Test
		@DisplayName("Leave admin can update a leave type name")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_LeaveAdmin_UpdatesName() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"name\": \"Renamed Leave Type\"}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].name").value("Renamed Leave Type"));
		}

		@Test
		@DisplayName("Omitted attributes are left unchanged")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_PartialUpdate_LeavesOmittedAttributesUnchanged() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"emojiCode\": \"U+1F334\"}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].emojiCode").value("U+1F334"))
				.andExpect(jsonPath("$.results[0].name").value("PolicyAnnual"))
				.andExpect(jsonPath("$.results[0].colorCode").value("#FFC107"))
				.andExpect(jsonPath("$.results[0].minDuration").value("FULL_DAY"))
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Leave admin can enable attachments and make them mandatory together")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_EnablesAttachmentAndMandatoryTogether_ReturnsOk() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"isAttachment\": true, \"isAttachmentMust\": true}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isAttachment").value(true))
				.andExpect(jsonPath("$.results[0].isAttachmentMust").value(true));
		}

		@Test
		@DisplayName("Returns bad request when attachments become mandatory while disabled on the stored type")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_AttachmentMustWithoutAttachment_ReturnsBadRequest() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"isAttachmentMust\": true}").andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when renaming to a name used by another leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE })
		void updatePolicyLeaveType_DuplicateName_ReturnsBadRequest() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"name\": \"policysick\"}").andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Leave type can keep its own name in a different case")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_OwnNameDifferentCase_ReturnsOk() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"name\": \"policyannual\"}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].name").value("policyannual"));
		}

		@Test
		@DisplayName("Returns bad request when the name is updated to a blank value")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void updatePolicyLeaveType_BlankName_ReturnsBadRequest() throws Exception {
			performUpdate(leaveAdminToken(), 100, "{\"name\": \"   \"}").andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns not found when the leave type does not exist")
		void updatePolicyLeaveType_UnknownId_ReturnsNotFound() throws Exception {
			performUpdate(leaveAdminToken(), 9999, "{\"name\": \"Renamed Leave Type\"}").andDo(print())
				.andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Activate And Deactivate Policy Leave Type")
	class ActivateDeactivatePolicyLeaveTypeTests {

		@Test
		@DisplayName("Leave admin can deactivate a leave type")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void deactivatePolicyLeaveType_LeaveAdmin_MarksInactive() throws Exception {
			performDeactivate(leaveAdminToken(), 100).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].id").value(100))
				.andExpect(jsonPath("$.results[0].isActive").value(false));
		}

		@Test
		@DisplayName("A deactivated leave type is no longer available for policy creation")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void deactivatePolicyLeaveType_RemovesTypeFromActiveList() throws Exception {
			performDeactivate(leaveAdminToken(), 100).andExpect(status().isOk());

			performGetAll(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].leaveTypes", hasSize(0)));
		}

		@Test
		@DisplayName("Leave admin cannot deactivate an already inactive leave type")
		@Sql(statements = { SEED_INACTIVE_LEAVE_TYPE })
		void deactivatePolicyLeaveType_AlreadyInactive_ReturnsBadRequest() throws Exception {
			performDeactivate(leaveAdminToken(), 101).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns not found when deactivating an unknown leave type")
		void deactivatePolicyLeaveType_UnknownId_ReturnsNotFound() throws Exception {
			performDeactivate(leaveAdminToken(), 9999).andDo(print()).andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Leave admin can activate an inactive leave type")
		@Sql(statements = { SEED_INACTIVE_LEAVE_TYPE })
		void activatePolicyLeaveType_LeaveAdmin_MarksActive() throws Exception {
			performActivate(leaveAdminToken(), 101).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].id").value(101))
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Leave admin cannot activate an already active leave type")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void activatePolicyLeaveType_AlreadyActive_ReturnsBadRequest() throws Exception {
			performActivate(leaveAdminToken(), 100).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns not found when activating an unknown leave type")
		void activatePolicyLeaveType_UnknownId_ReturnsNotFound() throws Exception {
			performActivate(leaveAdminToken(), 9999).andDo(print()).andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Role-Based Access Tests")
	class RoleBasedAccessTests {

		@Test
		@DisplayName("Non-admin user cannot list policy leave types")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void getPolicyLeaveTypes_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetAll(user2Token()).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot create a policy leave type")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void addPolicyLeaveType_LeaveEmployee_ReturnsForbidden() throws Exception {
			performCreate(user2Token(), VALID_LEAVE_TYPE_JSON).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot search policy leave types")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void searchPolicyLeaveTypes_LeaveEmployee_ReturnsForbidden() throws Exception {
			mvc.perform(get(SEARCH_ENDPOINT).accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(user2Token()))).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot get a policy leave type by id")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void getPolicyLeaveTypeById_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetById(user2Token(), 100).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot update a policy leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void updatePolicyLeaveType_LeaveEmployee_ReturnsForbidden() throws Exception {
			performUpdate(user2Token(), 100, "{\"name\": \"Renamed Leave Type\"}").andDo(print())
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot deactivate a policy leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void deactivatePolicyLeaveType_LeaveEmployee_ReturnsForbidden() throws Exception {
			performDeactivate(user2Token(), 100).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot activate a policy leave type")
		@Sql(statements = { SEED_INACTIVE_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void activatePolicyLeaveType_LeaveEmployee_ReturnsForbidden() throws Exception {
			performActivate(user2Token(), 101).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void addPolicyLeaveType_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content(VALID_LEAVE_TYPE_JSON)).andDo(print()).andExpect(status().isUnauthorized());
		}

	}

}
