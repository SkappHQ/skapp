package com.skapp.enterprise.common.security;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityServiceImpl;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.enterprise.common.model.Module;
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
					Role.ESIGN_EMPLOYEE));

		List<ModuleType> activeModuleTypes = moduleDao.findAll().stream().map(Module::getModuleName).toList();

		return authorities.stream().filter(authority -> {
			String auth = authority.getAuthority();
			return auth.equals(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN)
					|| activeModuleTypes.stream().anyMatch(moduleType -> auth.contains(String.valueOf(moduleType)));
		}).toList();
	}

}
