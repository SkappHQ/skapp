package com.skapp.community.common.security;

import com.skapp.community.common.model.User;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public interface AuthorityService {

	List<GrantedAuthority> getAuthorities(User user);

}
