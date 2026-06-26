package com.skapp.community.common.security;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

	private final UserDao userDao;

	private final AuthorityService authorityService;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userDao.findByEmail(email)
			.map(this::createUserDetails)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));
	}

	private UserDetails createUserDetails(User user) {
		return SkappUserDetails.builder()
			.username(user.getEmail())
			.password(user.getPassword())
			.enabled(user.getIsActive())
			.authorities(authorityService.getAuthorities(user))
			.build();
	}

}
