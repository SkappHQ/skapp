package com.skapp.enterprise.common.model.master;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "super_admin")
public class SuperAdmin implements UserDetails {

	@Id
	@Column(name = "id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "email")
	private String email;

	@Column(name = "first_name")
	private String firstName;

	@Column(name = "last_name")
	private String lastName;

	@Column(name = "password")
	private String password;

	@Column(name = "is_active")
	private boolean isActive;

	@Column(name = "verification_code")
	private String verificationCode;

	@Column(name = "is_verified")
	private boolean isVerified;

	@Column(name = "otp_expiry_time")
	private Instant otpExpiryTime;

	@Enumerated(EnumType.STRING)
	@Column(name = "login_method", columnDefinition = "varchar(255)")
	private LoginMethod loginMethod;

	@Column(name = "auth_pic", length = 500)
	private String authPic;

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		List<GrantedAuthority> authorities = new ArrayList<>();

		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.PEOPLE_ADMIN.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.PEOPLE_MANAGER.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.PEOPLE_EMPLOYEE.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.LEAVE_ADMIN.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.LEAVE_MANAGER.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.LEAVE_EMPLOYEE.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.ATTENDANCE_ADMIN.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.ATTENDANCE_MANAGER.name()));
		authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.ATTENDANCE_EMPLOYEE.name()));

		return authorities;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return isActive;
	}

}
