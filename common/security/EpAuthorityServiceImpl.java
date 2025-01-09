package com.skapp.enterprise.common.security;

import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityServiceImpl;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Primary
public class EpAuthorityServiceImpl extends AuthorityServiceImpl {

	public List<GrantedAuthority> getAuthorities(User user) {
		if (user.getEmployee().getEmployeeRole() == null) {
			return Collections.emptyList();
		}

		List<GrantedAuthority> authorities = super.getAuthorities(user);
		EmployeeRole employeeRole = user.getEmployee().getEmployeeRole();

		// Assign enterprise related roles here

		return authorities;
	}

}
