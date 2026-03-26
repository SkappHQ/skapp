package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.AiSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiSchedulerServiceImpl implements AiSchedulerService {

	private final RestTemplate restTemplate;

	private final OrganizationService organizationService;

	@Value("${migration-tool.base-url}")
	private String migrationToolBaseUrl;

	@Value("${migration-tool.api-key}")
	private String aiServiceApiKey;

	@Override
	public void triggerAiInsightsSchedule(String tenantId) {
		try {
			String aiSchedulerUrl = migrationToolBaseUrl + EpCommonConstants.AI_INSIGHTS_SCHEDULER_PATH;
			String timezone = organizationService.getOrganizationTimeZone();
			if (timezone == null) {
				timezone = "UTC";
			}

			HttpHeaders headers = new HttpHeaders();
			headers.set(EpAuthConstants.API_KEY_HEADER, aiServiceApiKey);
			headers.set(EpAuthConstants.TENANT_HEADER, tenantId);
			headers.setContentType(MediaType.APPLICATION_JSON);

			Map<String, String> body = Map.of("timezone", timezone);
			HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

			restTemplate.postForEntity(aiSchedulerUrl, entity, Object.class);
			log.info("triggerAiInsightsSchedule: Successfully triggered AI insights schedule for tenant: {}", tenantId);
		}
		catch (RestClientException e) {
			log.error("triggerAiInsightsSchedule: Failed to trigger AI insights schedule for tenant: {}", tenantId);
		}
	}

	@Override
	public void deleteAiInsightsSchedule(String tenantId) {
		try {
			String aiSchedulerUrl = migrationToolBaseUrl + EpCommonConstants.AI_INSIGHTS_SCHEDULER_PATH;

			HttpHeaders headers = new HttpHeaders();
			headers.set(EpAuthConstants.API_KEY_HEADER, aiServiceApiKey);
			headers.set(EpAuthConstants.TENANT_HEADER, tenantId);
			headers.setContentType(MediaType.APPLICATION_JSON);

			HttpEntity<Void> entity = new HttpEntity<>(headers);
			restTemplate.exchange(aiSchedulerUrl, HttpMethod.DELETE, entity, Object.class);
			log.info("deleteAiInsightsSchedule: Successfully deleted AI insights schedule for tenant: {}", tenantId);
		}
		catch (RestClientException e) {
			log.error("deleteAiInsightsSchedule: Failed to delete AI insights schedule for tenant: {}", tenantId);
		}
	}

}
