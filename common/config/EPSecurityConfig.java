package com.skapp.enterprise.common.config;

import com.skapp.community.common.component.AuthEntryPoint;
import com.skapp.community.common.component.ExceptionLoggingFilter;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.config.DocumentLinkAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
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

	private final EpJwtAuthFilter epJwtAuthFilter;

	private final TenantFilter tenantFilter;

	private final DocumentLinkAuthFilter documentLinkAuthFilter;

	private final UserDetailsService userDetailsService;

	private final AuthEntryPoint authEntryPoint;

	private final ExceptionLoggingFilter exceptionLoggingFilter;

	private final RequestMethodFilter requestMethodFilter;

	private final ApiKeyAuthFilter apiKeyAuthFilter;

	@Value("${cors.allowed-origins}")
	private String allowedOrigins;

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) {
		DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
		authProvider.setPasswordEncoder(passwordEncoder());

		http.cors(Customizer.withDefaults());
		http.csrf(AbstractHttpConfigurer::disable)
			.sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
			.exceptionHandling(exception -> exception.authenticationEntryPoint(authEntryPoint))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers("/internal/v1/ep/users", "/internal/v1/ep/users/auth-pics", "/internal/v1/ep/versions",
						"/internal/v1/ep/jobs", "/internal/v1/ep/invoice/customer", "/internal/v1/ep/invoice/project",
						"/internal/v1/ep/organization/timezone",
						"/internal/v1/ep/esign/migration/repair-document-hashes",
						"/internal/v1/ep/esign/migration/repair-document-hashes/status", "/internal/v1/ep/user/guest")
				.hasRole(EpAuthConstants.INTERNAL_API)
				.requestMatchers("/v1/auth/**", "/v3/api-docs/**", "/v3/api-docs", "/v3/api-docs.yaml",
						"/swagger-ui.html", "/swagger-ui/**", "/swagger-resources/**", "/webjars/**", "/favicon.ico",
						"/error", "/v1/app-setup-status", "/robots.txt", "/ws/**", "/v1/ep/auth/signup/super-admin",
						"/v1/ep/auth/signup/super-admin/sso/google", "/v1/ep/auth/signin/sso/google",
						"/v1/ep/auth/domain/verify", "/v1/ep/tenant/create", "/v1/ep/auth/recaptcha", "/health",
						"/deployment", "/v1/ep/organization/login-method", "/v1/ep/auth/password-reset",
						"/v1/ep/auth/password-reset/verify-otp", "/v1/ep/auth/password-reset/send-otp",
						"/v1/ep/auth/password-reset/resend-otp", "/v1/ep/auth/tenant/availability",
						"/v1/google-calendar/redirect", "/v1/validate/email", "/v1/ep/stripe/webhook",
						"/v2/ep/auth/sso/google/auth-url", "/v2/ep/auth/sso/google/redirect",
						"/v2/ep/auth/signin/sso/google", "/v2/ep/auth/signup/super-admin/sso/google",
						"/v1/ep/auth/code-challenge/verify", "/v1/ep/esign/document-link/resend",
						"/v1/ep/esign/document-link/token-exchange", "/v1/ep/esign/document-link/token/resend-status",
						"/v1/ep/redis/load-all-users", "/v1/ep/redis/load-system-version",
						"/v1/ep/redis/load-all-user-versions", "/internal/v1/ep/users",
						"/internal/v1/ep/users/auth-pics", "/v2/ep/auth/sso/microsoft/auth-url",
						"/v2/ep/auth/sso/microsoft/redirect", "/v2/ep/auth/signup/super-admin/sso/microsoft",
						"/v2/ep/auth/signin/sso/microsoft", "/internal/v1/ep/versions", "/internal/v1/ep/jobs",
						"/v1/ep/release/generate-pdf", "/v1/microsoft-calendar/redirect",
						"/internal/v1/ep/invoice/customer", "/internal/v1/ep/invoice/project",
						"/v1/ep/auth/signin/guest/send-otp", "/v1/ep/auth/signin/guest/resend-otp",
						"/v1/ep/auth/signin/guest/verify-otp", "/v1/ep/auth/status", "/v1/auth/session/sign-in",
						"/v1/auth/session/sign-out", "/v1/auth/session/refresh-token",
						"/v2/ep/auth/session/signin/sso/google", "/v2/ep/auth/session/signin/sso/microsoft",
						"/v1/ep/auth/session/code-challenge/verify", "/v1/ep/auth/session/signin/guest/verify-otp",
						"/v1/ep/esign/document-link/send-otp", "/v1/ep/esign/document-link/resend-otp",
						"/v1/ep/esign/document-link/verify-otp")
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
		http.addFilterBefore(requestMethodFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(tenantFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(documentLinkAuthFilter, UsernamePasswordAuthenticationFilter.class);
		http.addFilterBefore(epJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		http.authenticationProvider(authProvider);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		String[] origins = allowedOrigins.split(",");

		configuration.setAllowedOriginPatterns(Arrays.asList(origins));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Tenant-ID", "Referer",
				"Origin", "Stripe-Signature", "X-Api-Key"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration credentialedConfig = getCorsConfigurationCookies(origins);
		source.registerCorsConfiguration("/v1/auth/session/sign-in", credentialedConfig);
		source.registerCorsConfiguration("/v1/auth/session/sign-out", credentialedConfig);
		source.registerCorsConfiguration("/v1/auth/session/refresh-token", credentialedConfig);
		source.registerCorsConfiguration("/v2/ep/auth/session/signin/sso/google", credentialedConfig);
		source.registerCorsConfiguration("/v2/ep/auth/session/signin/sso/microsoft", credentialedConfig);
		source.registerCorsConfiguration("/v1/ep/auth/session/code-challenge/verify", credentialedConfig);
		source.registerCorsConfiguration("/v1/ep/auth/session/signin/guest/verify-otp", credentialedConfig);
		source.registerCorsConfiguration("/v1/ep/cf/cookies/**", credentialedConfig);

		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	private CorsConfiguration getCorsConfigurationCookies(String[] origins) {
		CorsConfiguration credentialedConfig = new CorsConfiguration();
		credentialedConfig.setAllowedOriginPatterns(Arrays.asList(origins));
		credentialedConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		credentialedConfig.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Tenant-ID", "Referer",
				"Origin", "Stripe-Signature", "Set-Cookie"));
		credentialedConfig.setExposedHeaders(List.of("Set-Cookie"));
		credentialedConfig.setAllowCredentials(true);
		return credentialedConfig;
	}

}
