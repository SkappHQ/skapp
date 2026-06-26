package com.skapp.community.common.security;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
@Builder
public class SkappUserDetails implements UserDetails {

	private static final boolean ACCOUNT_NON_EXPIRED = true;

	private static final boolean ACCOUNT_NON_LOCKED = true;

	private static final boolean CREDENTIALS_NON_EXPIRED = true;

	private final String username;

	private final String password;

	private final boolean enabled;

	private final Collection<? extends GrantedAuthority> authorities;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return ACCOUNT_NON_EXPIRED;
	}

	@Override
	public boolean isAccountNonLocked() {
		return ACCOUNT_NON_LOCKED;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return CREDENTIALS_NON_EXPIRED;
	}

	@Override
	public boolean isEnabled() {
		return enabled;
	}

}
