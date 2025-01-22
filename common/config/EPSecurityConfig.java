package com.skapp.enterprise.common.config;

import com.skapp.community.common.component.AuthEntryPoint;
import com.skapp.community.common.component.ExceptionLoggingFilter;
import com.skapp.community.common.component.ResetDatabaseApiKeyFilter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@Primary
public class EPSecurityConfig {

	@NonNull
	private final EpJwtAuthFilter epJwtAuthFilter;

	@NonNull
	private final TenantFilter tenantFilter;

	@NonNull
	private final UserDetailsService userDetailsService;

	@NonNull
	private final AuthEntryPoint authEntryPoint;

	@NonNull
	private final ResetDatabaseApiKeyFilter resetDatabaseApiKeyFilter;

	@NonNull
	private final ExceptionLoggingFilter exceptionLoggingFilter;

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
		authProvider.setUserDetailsService(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());
		return authProvider;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.cors(Customizer.withDefaults());
		http.csrf(AbstractHttpConfigurer::disable)
			.sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
			.exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/v1/auth/**", "/v3/api-docs/**", "/v3/api-docs", "/v3/api-docs.yaml",
						"/swagger-ui.html", "/swagger-ui/**", "/swagger-resources/**", "/webjars/**", "/favicon.ico",
						"/error", "/v1/app-setup-status", "/robots.txt", "/ws/**", "/v1/ep/auth/signup/super-admin",
						"/v1/ep/auth/signup/super-admin/sso/google", "/v1/ep/auth/signin/sso/google",
						"/v1/ep/auth/domain/verify", "/v1/ep/tenant/create", "/v1/ep/auth/recaptcha", "/health",
						"/v1/ep/organization/login-method", "/v1/ep/auth/password-reset",
						"/v1/ep/auth/password-reset/verify-otp", "/v1/ep/auth/password-reset/send-otp",
						"/v1/ep/auth/password-reset/resend-otp", "/v1/ep/auth/tenant/availability")
				.permitAll()
				.requestMatchers("/v1/reset-database")
				.permitAll()
				.anyRequest()
				.authenticated());

		http.headers(headers -> headers
			// Enables XSS protection with blocking mode
			.xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
			// Prevents clickjacking attacks
			.frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
			// Disables caching
			.cacheControl(HeadersConfigurer.CacheControlConfig::disable));

		http.addFilterBefore(exceptionLoggingFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(epJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(resetDatabaseApiKeyFilter, UsernamePasswordAuthenticationFilter.class);

		http.authenticationProvider(authenticationProvider());

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("*"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "X-Tenant-ID"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
