package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.ModuleRolesRestriction;
import com.skapp.community.peopleplanner.payload.request.ModuleRoleRestrictionRequestDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.ModuleRolesRestrictionDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.impl.RolesServiceImpl;
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

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolesServiceImplUnitTest {

	RolesServiceImpl rolesService;

	@Mock
	private EmployeeRoleDao employeeRoleDao;

	@Mock
	private UserService userService;

	@Mock
	private UserVersionService userVersionService;

	@Mock
	private EmployeeDao employeeDao;

	@Mock
	private TeamDao teamDao;

	@Mock
	private PeopleMapper peopleMapper;

	@Mock
	private ModuleRoleRestrictionDao moduleRoleRestrictionDao;

	@Mock
	private ModuleRolesRestrictionDao moduleRolesRestrictionDao;

	@Mock
	private MessageUtil messageUtil;

	@BeforeEach
	void setup() {
		rolesService = Mockito.spy(new RolesServiceImpl(employeeRoleDao, userService, userVersionService, employeeDao,
				teamDao, peopleMapper, moduleRoleRestrictionDao, moduleRolesRestrictionDao, messageUtil));
	}

	@Test
	void getRestrictedRoleByModule_bothRolesRestricted_returnsRestrictionsAndDerivedFlags() {
		when(moduleRolesRestrictionDao.findById(ModuleType.PEOPLE))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.PEOPLE, "ADMIN,MANAGER")));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.PEOPLE);

		Assertions.assertEquals(ModuleType.PEOPLE, response.getModule());
		Assertions.assertEquals(List.of(RoleLevel.ADMIN, RoleLevel.MANAGER), response.getRestrictions());
		Assertions.assertTrue(response.getIsAdmin());
		Assertions.assertTrue(response.getIsManager());
	}

	@Test
	void getRestrictedRoleByModule_onlyAdminRestricted_returnsIsManagerFalse() {
		when(moduleRolesRestrictionDao.findById(ModuleType.LEAVE))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.LEAVE, "ADMIN")));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.LEAVE);

		Assertions.assertEquals(List.of(RoleLevel.ADMIN), response.getRestrictions());
		Assertions.assertTrue(response.getIsAdmin());
		Assertions.assertFalse(response.getIsManager());
	}

	@Test
	void getRestrictedRoleByModule_noRowForModule_returnsEmptyRestrictionsAndFalseFlags() {
		when(moduleRolesRestrictionDao.findById(ModuleType.ATTENDANCE)).thenReturn(Optional.empty());

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.ATTENDANCE);

		Assertions.assertEquals(ModuleType.ATTENDANCE, response.getModule());
		Assertions.assertTrue(response.getRestrictions().isEmpty());
		Assertions.assertFalse(response.getIsAdmin());
		Assertions.assertFalse(response.getIsManager());
	}

	@Test
	void getRestrictedRoleByModule_nullRestrictions_returnsEmptyRestrictions() {
		when(moduleRolesRestrictionDao.findById(ModuleType.LEAVE))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.LEAVE, null)));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.LEAVE);

		Assertions.assertTrue(response.getRestrictions().isEmpty());
		Assertions.assertFalse(response.getIsAdmin());
		Assertions.assertFalse(response.getIsManager());
	}

	/**
	 * The legacy boolean pair represents the module's manager level role, so a restricted
	 * CRM sales manager has to surface as isManager for existing clients.
	 */
	@Test
	void getRestrictedRoleByModule_crmSalesManagerRestricted_returnsIsManagerTrue() {
		when(moduleRolesRestrictionDao.findById(ModuleType.CRM))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.CRM, "SALES_MANAGER")));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.CRM);

		Assertions.assertEquals(List.of(RoleLevel.SALES_MANAGER), response.getRestrictions());
		Assertions.assertFalse(response.getIsAdmin());
		Assertions.assertTrue(response.getIsManager());
	}

	@Test
	void getRestrictedRoleByModule_esignSenderRestricted_returnsIsManagerTrue() {
		when(moduleRolesRestrictionDao.findById(ModuleType.ESIGN))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.ESIGN, "SENDER")));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.ESIGN);

		Assertions.assertEquals(List.of(RoleLevel.SENDER), response.getRestrictions());
		Assertions.assertTrue(response.getIsManager());
	}

	@Test
	void getRestrictedRoleByModule_neverReadsLegacyTable() {
		when(moduleRolesRestrictionDao.findById(ModuleType.PEOPLE))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.PEOPLE, "ADMIN")));

		rolesService.getRestrictedRoleByModule(ModuleType.PEOPLE);

		Mockito.verifyNoInteractions(moduleRoleRestrictionDao);
	}

	@Test
	void getRestrictedRoleByModule_managerModule_returnsAdminAndManagerAsRestrictable() {
		when(moduleRolesRestrictionDao.findById(ModuleType.PEOPLE)).thenReturn(Optional.empty());

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.PEOPLE);

		Assertions.assertEquals(List.of(RoleLevel.ADMIN, RoleLevel.MANAGER), response.getRestrictableRoles());
	}

	@Test
	void getRestrictedRoleByModule_crm_returnsAdminAndSalesManagerAsRestrictable() {
		when(moduleRolesRestrictionDao.findById(ModuleType.CRM)).thenReturn(Optional.empty());

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.CRM);

		Assertions.assertEquals(List.of(RoleLevel.ADMIN, RoleLevel.SALES_MANAGER), response.getRestrictableRoles());
	}

	/**
	 * PM has no manager level role, so only the admin role can be restricted.
	 */
	@Test
	void getRestrictedRoleByModule_moduleWithoutManagerRole_returnsOnlyAdminAsRestrictable() {
		when(moduleRolesRestrictionDao.findById(ModuleType.PM)).thenReturn(Optional.empty());

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.PM);

		Assertions.assertEquals(List.of(RoleLevel.ADMIN), response.getRestrictableRoles());
	}

	/**
	 * ESIGN is an enterprise only module, so the community edition offers nothing to
	 * restrict. The enterprise override adds it.
	 */
	@Test
	void getRestrictedRoleByModule_moduleNotInEdition_returnsNoRestrictableRoles() {
		when(moduleRolesRestrictionDao.findById(ModuleType.ESIGN)).thenReturn(Optional.empty());

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.ESIGN);

		Assertions.assertTrue(response.getRestrictableRoles().isEmpty());
	}

	/**
	 * A stored value is read leniently, so surrounding whitespace does not lose a
	 * restriction.
	 */
	@Test
	void getRestrictedRoleByModule_untrimmedStoredValue_returnsAllRestrictions() {
		when(moduleRolesRestrictionDao.findById(ModuleType.PEOPLE))
			.thenReturn(Optional.of(moduleRolesRestriction(ModuleType.PEOPLE, " ADMIN , MANAGER ")));

		ModuleRoleRestrictionResponseDto response = rolesService.getRestrictedRoleByModule(ModuleType.PEOPLE);

		Assertions.assertEquals(List.of(RoleLevel.ADMIN, RoleLevel.MANAGER), response.getRestrictions());
		Assertions.assertTrue(response.getIsAdmin());
		Assertions.assertTrue(response.getIsManager());
	}

	/**
	 * The same set of restricted roles always has to be written the same way, so the
	 * stored value stays comparable.
	 */
	@Test
	void updateRoleRestrictions_unorderedRestrictions_writesDeclarationOrder() {
		rolesService.updateRoleRestrictions(roleRestrictionRequest(ModuleType.CRM,
				List.of(RoleLevel.SALES_MANAGER, RoleLevel.ADMIN, RoleLevel.ADMIN)));

		Assertions.assertEquals("ADMIN,SALES_MANAGER", savedRestrictions().getRestrictions());
	}

	@Test
	void updateRoleRestrictions_noRestrictions_writesNull() {
		rolesService.updateRoleRestrictions(roleRestrictionRequest(ModuleType.PEOPLE, List.of()));

		Assertions.assertNull(savedRestrictions().getRestrictions());
	}

	/**
	 * Legacy clients send the boolean pair instead of a role list, and the module's
	 * manager level role is what that pair means.
	 */
	@Test
	void updateRoleRestrictions_legacyBooleansForCrm_writesSalesManager() {
		ModuleRoleRestrictionRequestDto request = roleRestrictionRequest(ModuleType.CRM, null);
		request.setIsAdmin(false);
		request.setIsManager(true);

		rolesService.updateRoleRestrictions(request);

		Assertions.assertEquals("SALES_MANAGER", savedRestrictions().getRestrictions());
	}

	private ModuleRolesRestriction savedRestrictions() {
		ArgumentCaptor<ModuleRolesRestriction> captor = ArgumentCaptor.forClass(ModuleRolesRestriction.class);
		verify(moduleRolesRestrictionDao).save(captor.capture());
		return captor.getValue();
	}

	private ModuleRoleRestrictionRequestDto roleRestrictionRequest(ModuleType module, List<RoleLevel> restrictions) {
		ModuleRoleRestrictionRequestDto request = new ModuleRoleRestrictionRequestDto();
		request.setModule(module);
		request.setRestrictions(restrictions);
		return request;
	}

	private ModuleRolesRestriction moduleRolesRestriction(ModuleType module, String restrictions) {
		ModuleRolesRestriction moduleRolesRestriction = new ModuleRolesRestriction();
		moduleRolesRestriction.setModule(module);
		moduleRolesRestriction.setRestrictions(restrictions);
		return moduleRolesRestriction;
	}

}
