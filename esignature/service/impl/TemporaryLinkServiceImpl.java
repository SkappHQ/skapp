package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.esignature.model.TemporaryLink;
import com.skapp.enterprise.esignature.repository.TemporaryLinkRepository;
import com.skapp.enterprise.esignature.service.TemporaryLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemporaryLinkServiceImpl implements TemporaryLinkService {

	private final TemporaryLinkRepository temporaryLinkRepository;

	private final JwtService jwtService;

	@Value("${app.temporary-link.default-expiration-hours:48}")
	private int defaultExpirationHours;

	@Value("${app.temporary-link.max-clicks:5}")
	private int defaultMaxClicks;

	@Override
	@Transactional
	public String createTemporaryLink(Long documentId, Integer expirationHours, Integer maxClicks) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || authentication.getPrincipal() == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		Long userId = (Long) authentication.getCredentials();
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();

		// Create temporary link record
		TemporaryLink temporaryLink = TemporaryLink.builder()
			.documentId(documentId)
			.tenantId(tenantId)
			.createdByUserId(userId)
			.createdAt(LocalDateTime.now())
			.expiresAt(
					LocalDateTime.now().plusHours(expirationHours != null ? expirationHours : defaultExpirationHours))
			.maxClicks(maxClicks != null ? maxClicks : defaultMaxClicks)
			.clickCount(0)
			.active(true)
			.build();

		temporaryLinkRepository.save(temporaryLink);

		// Generate JWT token for this temporary link
		String token = generateTemporaryLinkToken(userDetails, userId, temporaryLink.getId(), tenantId, documentId);

		// Update the token in the database
		temporaryLink.setToken(token);
		temporaryLinkRepository.save(temporaryLink);

		return token;
	}

	@Override
	@Transactional
	public TemporaryLink validateAndGetLink(String token) {
		TemporaryLink temporaryLink = temporaryLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		if (temporaryLink.isExpired()) {
			temporaryLink.setActive(false);
			temporaryLinkRepository.save(temporaryLink);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_LINK_EXPIRED);
		}

		temporaryLink.incrementClickCount();
		temporaryLinkRepository.save(temporaryLink);

		return temporaryLink;
	}

	@Override
	@Transactional
	public void deactivateLink(String token) {
		TemporaryLink temporaryLink = temporaryLinkRepository.findByToken(token)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_LINK));

		temporaryLink.setActive(false);
		temporaryLinkRepository.save(temporaryLink);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TemporaryLink> getActiveLinksForDocument(Long documentId) {
		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		return temporaryLinkRepository.findActiveByDocumentIdAndTenantId(documentId, tenantId);
	}

	@Override
	@Transactional
	public void deactivateAllForDocument(Long documentId) {
		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_NOT_FOUND);
		}

		List<TemporaryLink> activeLinks = temporaryLinkRepository.findActiveByDocumentIdAndTenantId(documentId,
				tenantId);
		activeLinks.forEach(link -> {
			link.setActive(false);
			temporaryLinkRepository.save(link);
		});
	}

	private String generateTemporaryLinkToken(UserDetails userDetails, Long userId, Long linkId, String tenantId,
			Long documentId) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("sub", userDetails.getUsername());
		claims.put("userId", userId);
		claims.put(EpAuthConstants.TENANT_ID, tenantId);
		claims.put("documentId", documentId);
		claims.put("linkId", linkId);
		claims.put("tempLink", true);

		// 48 hours expiration
		Date expirationDate = new Date(System.currentTimeMillis() + 48 * 60 * 60 * 1000);
		return jwtService.generateTemporaryAccessToken(userDetails, claims, expirationDate);
	}

}