package com.skapp.community.common.component;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuditorProvider implements AuditorAware<String> {

	@Override
	@NonNull
	public Optional<String> getCurrentAuditor() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication != null && authentication.isAuthenticated()) {
			Object credentials = authentication.getCredentials();

			String userId = null;
			if (credentials instanceof Long) {
				userId = credentials.toString();
			}
			else if (credentials instanceof String userIdCredentials && !userIdCredentials.isEmpty()) {
				userId = Long.toString(Long.parseLong(userIdCredentials));
			}

			return Optional.ofNullable(userId);
		}

		return Optional.empty();
	}

}
