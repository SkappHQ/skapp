package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.peopleplanner.model.ModuleRoleRestriction;
import com.skapp.community.peopleplanner.model.ModuleRolesRestriction;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.ModuleRolesRestrictionDao;
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

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Roles Controller Integration Tests")
class RolesControllerIntegrationTest {

	private static final String RESTRICTIONS_PATH = "/v1/roles/restrictions";

	private static final String RESTRICTIONS_FIELD = "['restrictions']";

	private static final String RESTRICTABLE_ROLES_FIELD = "['restrictableRoles']";

	private static final String IS_ADMIN_FIELD = "['isAdmin']";

	private static final String IS_MANAGER_FIELD = "['isManager']";

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final ModuleRoleRestrictionDao moduleRoleRestrictionDao;

	private final ModuleRolesRestrictionDao moduleRolesRestrictionDao;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions getRestrictionsByModule(ModuleType module) throws Exception {
		return performRequest(get(RESTRICTIONS_PATH + "/" + module.name()).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions updateRestrictions(String body) throws Exception {
		return performRequest(patch(RESTRICTIONS_PATH).contentType(MediaType.APPLICATION_JSON).content(body));
	}

	/**
	 * Stores a raw restrictions value, which the update endpoint cannot produce, so the
	 * read path can be exercised against values already sitting in the table.
	 */
	private void storeRestrictions(ModuleType module, String restrictions) {
		ModuleRolesRestriction moduleRolesRestriction = new ModuleRolesRestriction();
		moduleRolesRestriction.setModule(module);
		moduleRolesRestriction.setRestrictions(restrictions);
		moduleRolesRestrictionDao.save(moduleRolesRestriction);
	}

	@Nested
	@DisplayName("Get Restricted Roles By Module Tests")
	class GetRestrictedRolesByModuleTests {

		@Test
		@DisplayName("Get restrictions with both roles restricted - Returns restrictions and derived flags")
		void getRestrictions_BothRolesRestricted_ReturnsRestrictionsAndDerivedFlags() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN,MANAGER");

			getRestrictionsByModule(ModuleType.PEOPLE).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['module']").value(ModuleType.PEOPLE.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD,
						containsInAnyOrder(RoleLevel.ADMIN.name(), RoleLevel.MANAGER.name())))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(true))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(true));
		}

		@Test
		@DisplayName("Get restrictions with only admin restricted - Returns isManager false")
		void getRestrictions_OnlyAdminRestricted_ReturnsIsManagerFalse() throws Exception {
			storeRestrictions(ModuleType.LEAVE, "ADMIN");

			getRestrictionsByModule(ModuleType.LEAVE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.ADMIN.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(true))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(false));
		}

		@Test
		@DisplayName("Get restrictions for module with no stored row - Returns empty restrictions and false flags")
		void getRestrictions_NoRowForModule_ReturnsEmptyRestrictionsAndFalseFlags() throws Exception {
			getRestrictionsByModule(ModuleType.ATTENDANCE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + "['module']").value(ModuleType.ATTENDANCE.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, empty()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(false))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(false));
		}

		@Test
		@DisplayName("Get restrictions with null stored restrictions - Returns empty restrictions")
		void getRestrictions_NullStoredRestrictions_ReturnsEmptyRestrictions() throws Exception {
			storeRestrictions(ModuleType.LEAVE, null);

			getRestrictionsByModule(ModuleType.LEAVE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, empty()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(false))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(false));
		}

		/**
		 * The legacy boolean pair represents the module's manager level role, so a
		 * restricted CRM sales manager has to surface as isManager for existing clients.
		 */
		@Test
		@DisplayName("Get restrictions with CRM sales manager restricted - Returns isManager true")
		void getRestrictions_CrmSalesManagerRestricted_ReturnsIsManagerTrue() throws Exception {
			storeRestrictions(ModuleType.CRM, "SALES_MANAGER");

			getRestrictionsByModule(ModuleType.CRM).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.SALES_MANAGER.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(false))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(true));
		}

		@Test
		@DisplayName("Get restrictions with eSign sender restricted - Returns isManager true")
		void getRestrictions_EsignSenderRestricted_ReturnsIsManagerTrue() throws Exception {
			storeRestrictions(ModuleType.ESIGN, "SENDER");

			getRestrictionsByModule(ModuleType.ESIGN).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.SENDER.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(true));
		}

		/**
		 * A stored value is read leniently, so surrounding whitespace does not lose a
		 * restriction.
		 */
		@Test
		@DisplayName("Get restrictions with untrimmed stored value - Returns all restrictions")
		void getRestrictions_UntrimmedStoredValue_ReturnsAllRestrictions() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, " ADMIN , MANAGER ");

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD,
						containsInAnyOrder(RoleLevel.ADMIN.name(), RoleLevel.MANAGER.name())))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(true))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(true));
		}

		/**
		 * module_roles_restriction is the only source for the read path, so a row left
		 * behind in the legacy table does not restrict anything.
		 */
		@Test
		@DisplayName("Get restrictions with legacy table row only - Returns no restrictions")
		void getRestrictions_LegacyTableRowOnly_ReturnsNoRestrictions() throws Exception {
			ModuleRoleRestriction legacyRestriction = new ModuleRoleRestriction();
			legacyRestriction.setModule(ModuleType.PEOPLE);
			legacyRestriction.setIsAdmin(true);
			legacyRestriction.setIsManager(true);
			moduleRoleRestrictionDao.save(legacyRestriction);

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, empty()))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_ADMIN_FIELD).value(false))
				.andExpect(jsonPath(RESULTS_0_PATH + IS_MANAGER_FIELD).value(false));
		}

		@Test
		@DisplayName("Get restrictions for manager module - Returns admin and manager as restrictable")
		void getRestrictions_ManagerModule_ReturnsAdminAndManagerAsRestrictable() throws Exception {
			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD, hasSize(2)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD + "[0]").value(RoleLevel.ADMIN.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD + "[1]").value(RoleLevel.MANAGER.name()));
		}

		@Test
		@DisplayName("Get restrictions for CRM - Returns admin and sales manager as restrictable")
		void getRestrictions_Crm_ReturnsAdminAndSalesManagerAsRestrictable() throws Exception {
			getRestrictionsByModule(ModuleType.CRM).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD, hasSize(2)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD + "[0]").value(RoleLevel.ADMIN.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD + "[1]")
					.value(RoleLevel.SALES_MANAGER.name()));
		}

		/**
		 * PM has no manager level role, so only the admin role can be restricted.
		 */
		@Test
		@DisplayName("Get restrictions for module without manager role - Returns only admin as restrictable")
		void getRestrictions_ModuleWithoutManagerRole_ReturnsOnlyAdminAsRestrictable() throws Exception {
			getRestrictionsByModule(ModuleType.PM).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD + "[0]").value(RoleLevel.ADMIN.name()));
		}

		/**
		 * ESIGN is an enterprise only module, so the community edition offers nothing to
		 * restrict. The enterprise override adds it.
		 */
		@Test
		@DisplayName("Get restrictions for module not in edition - Returns no restrictable roles")
		void getRestrictions_ModuleNotInEdition_ReturnsNoRestrictableRoles() throws Exception {
			getRestrictionsByModule(ModuleType.ESIGN).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTABLE_ROLES_FIELD, empty()));
		}

		@Test
		@DisplayName("Get restrictions without super admin role - Returns Forbidden")
		void getRestrictions_WithoutSuperAdminRole_ReturnsForbidden() throws Exception {
			authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("Update Role Restrictions Tests")
	class UpdateRoleRestrictionsTests {

		@Test
		@DisplayName("Add to empty baseline - Restricts the added role")
		void update_AddToEmptyBaseline_RestrictsAddedRole() throws Exception {
			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"ADMIN\"]}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.ADMIN.name()));
		}

		@Test
		@DisplayName("Add on top of existing restriction - Merges with baseline")
		void update_AddOnTopOfExisting_MergesWithBaseline() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN");

			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"MANAGER\"]}").andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD,
						containsInAnyOrder(RoleLevel.ADMIN.name(), RoleLevel.MANAGER.name())));
		}

		@Test
		@DisplayName("Remove from baseline - Clears only the removed role")
		void update_RemoveFromBaseline_ClearsRemovedRole() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN,MANAGER");

			updateRestrictions("{\"module\":\"PEOPLE\",\"remove\":[\"ADMIN\"]}").andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.MANAGER.name()));
		}

		@Test
		@DisplayName("Add and remove together - Remove applies before add")
		void update_AddAndRemoveTogether_RemoveAppliesBeforeAdd() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN");

			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"MANAGER\"],\"remove\":[\"ADMIN\"]}")
				.andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.MANAGER.name()));
		}

		@Test
		@DisplayName("Add an already restricted role - Idempotent")
		void update_AddAlreadyRestrictedRole_Idempotent() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN");

			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"ADMIN\"]}").andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.ADMIN.name()));
		}

		@Test
		@DisplayName("Remove a role that is not restricted - Idempotent")
		void update_RemoveNotRestrictedRole_Idempotent() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "ADMIN");

			updateRestrictions("{\"module\":\"PEOPLE\",\"remove\":[\"MANAGER\"]}").andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD + "[0]").value(RoleLevel.ADMIN.name()));
		}

		/**
		 * Removal is not validated against restrictable roles, so a value stored by the
		 * lossy sync job can always be cleared.
		 */
		@Test
		@DisplayName("Remove a non-restrictable stored role - Clears it")
		void update_RemoveNonRestrictableStoredRole_ClearsIt() throws Exception {
			storeRestrictions(ModuleType.PEOPLE, "EMPLOYEE");

			updateRestrictions("{\"module\":\"PEOPLE\",\"remove\":[\"EMPLOYEE\"]}").andExpect(status().isOk());

			getRestrictionsByModule(ModuleType.PEOPLE).andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + RESTRICTIONS_FIELD, empty()));
		}

		@Test
		@DisplayName("Update with no module - Returns Bad Request")
		void update_NoModule_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"add\":[\"ADMIN\"]}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Update with COMMON module - Returns Bad Request")
		void update_CommonModule_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"module\":\"COMMON\",\"add\":[\"ADMIN\"]}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Add a non-restrictable role - Returns Bad Request")
		void update_AddNonRestrictableRole_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"EMPLOYEE\"]}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Add with a null entry - Returns Bad Request")
		void update_AddWithNullEntry_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[null]}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Add with duplicate entries - Returns Bad Request")
		void update_AddWithDuplicateEntries_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"ADMIN\",\"ADMIN\"]}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Same role in add and remove - Returns Bad Request")
		void update_SameRoleInAddAndRemove_ReturnsBadRequest() throws Exception {
			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"ADMIN\"],\"remove\":[\"ADMIN\"]}")
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Update without super admin role - Returns Forbidden")
		void update_WithoutSuperAdminRole_ReturnsForbidden() throws Exception {
			authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);

			updateRestrictions("{\"module\":\"PEOPLE\",\"add\":[\"ADMIN\"]}").andExpect(status().isForbidden());
		}

	}

}
