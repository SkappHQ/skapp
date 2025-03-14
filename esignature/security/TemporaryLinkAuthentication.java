package com.skapp.enterprise.esignature.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

public class TemporaryLinkAuthentication extends AbstractAuthenticationToken {

	private final Long userId;

	private final String documentId;

	private final String tenantId;

	public TemporaryLinkAuthentication(Long userId, String documentId, String tenantId) {
		super(Collections.singleton(new SimpleGrantedAuthority("ROLE_TEMPORARY_SIGNER")));
		this.userId = userId;
		this.documentId = documentId;
		this.tenantId = tenantId;
		setAuthenticated(true);
	}

	@Override
	public Object getCredentials() {
		return null;
	}

	@Override
	public Object getPrincipal() {
		return userId;
	}

	public String getDocumentId() {
		return documentId;
	}

	public String getTenantId() {
		return tenantId;
	}

}