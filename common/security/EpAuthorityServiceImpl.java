package com.skapp.enterprise.common.security;

import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityServiceImpl;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.enterprise.common.model.ModuleConfig;
import com.skapp.enterprise.common.repository.ModuleDao;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Primary
public class EpAuthorityServiceImpl extends AuthorityServiceImpl {

	private final ModuleDao moduleDao;

	@Override
	public List<GrantedAuthority> getAuthorities(User user) {
		if (user.getEmployee().getEmployeeRole() == null) {
			return Collections.emptyList();
		}

		List<GrantedAuthority> authorities = super.getAuthorities(user);
		EmployeeRole employeeRole = user.getEmployee().getEmployeeRole();

		Optional.ofNullable(employeeRole.getEsignRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.ESIGN_ADMIN, Role.ESIGN_SENDER,
					Role.ESIGN_EMPLOYEE, null));

		Optional.ofNullable(employeeRole.getPmRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.PM_ADMIN, null, Role.PM_EMPLOYEE,
					Role.PM_GUEST_EMPLOYEE));

		Optional.ofNullable(employeeRole.getInvoiceRole())
			.ifPresent(
					role -> addRoleHierarchy(authorities, role, Role.INVOICE_ADMIN, Role.INVOICE_MANAGER, null, null));

		ModuleConfig moduleConfig = moduleDao.findAll().getFirst();
		return authorities.stream().filter(authority -> {
			String auth = authority.getAuthority();

			if (auth.contains(Role.SUPER_ADMIN.name()) || auth.contains(ModuleType.PEOPLE.name())) {
				return true;
			}
			if (auth.contains(ModuleType.LEAVE.name())) {
				return moduleConfig.isLeaveModule();
			}
			if (auth.contains(ModuleType.ATTENDANCE.name())) {
				return moduleConfig.isAttendanceModule();
			}
			if (auth.contains(ModuleType.ESIGN.name())) {
				return moduleConfig.isEsignModule();
			}
			if (auth.contains(ModuleType.PM.name())) {
				return moduleConfig.isPmModule();
			}
			if (auth.contains(ModuleType.INVOICE.name())) {
				return moduleConfig.isInvoiceModule();
			}
			if (auth.contains(ModuleType.CRM.name())) {
				return moduleConfig.isCrmModule();
			}
			return false;
		}).toList();
	}

}
