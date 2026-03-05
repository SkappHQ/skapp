package com.skapp.enterprise.esignature.eid.bankid;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.esignature.constant.EidMessageConstant;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdAuthRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCancelRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignResponse;
import com.skapp.enterprise.esignature.eid.config.BankIdProperties;
import com.skapp.enterprise.esignature.type.BankIdOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP client for BankID API v6.0.
 *
 * <p>
 * Provides methods to call BankID /auth, /sign, /collect, and /cancel endpoints. Uses a
 * RestTemplate configured with mTLS for client certificate authentication.
 * </p>
 *
 * <p>
 * Activated when: skapp.esign.eid.providers.swedish-bankid.enabled=true
 * </p>
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "skapp.esign.eid.providers.swedish-bankid.enabled", havingValue = "true")
public class BankIdClient {

	private final RestTemplate restTemplate;

	private final BankIdProperties bankIdProperties;

	public BankIdClient(@Qualifier("bankIdRestTemplate") RestTemplate restTemplate, BankIdProperties bankIdProperties) {
		this.restTemplate = restTemplate;
		this.bankIdProperties = bankIdProperties;
	}

	/**
	 * Initiates an identification order with BankID.
	 *
	 * <p>
	 * Calls POST /auth endpoint with the user's IP. Unlike /sign, no document hash is
	 * required — this flow verifies the user's identity only.
	 * </p>
	 * @param request The auth request containing endUserIp and optional userVisibleData
	 * @return Response containing orderRef, autoStartToken, qrStartToken, qrStartSecret
	 * @throws org.springframework.web.client.HttpStatusCodeException if the API call
	 * fails
	 */
	public BankIdSignResponse auth(BankIdAuthRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.AUTH.getEndpoint();
		log.debug("BankID {} request to {}", BankIdOperation.AUTH.getEndpoint(), url);

		HttpEntity<BankIdAuthRequest> entity = new HttpEntity<>(request, createHeaders());
		ResponseEntity<BankIdSignResponse> response = restTemplate.postForEntity(url, entity, BankIdSignResponse.class);

		BankIdSignResponse authBody = response.getBody();
		if (authBody == null) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_INITIATION_FAILED);
		}

		log.debug("BankID {} successful, orderRef={}", BankIdOperation.AUTH.getEndpoint(), authBody.getOrderRef());
		return authBody;
	}

	/**
	 * Initiates a signing order with BankID.
	 *
	 * <p>
	 * Calls POST /sign endpoint with user IP and the data to be signed.
	 * </p>
	 * @param request The sign request containing endUserIp, userVisibleData, etc.
	 * @return Response containing orderRef, autoStartToken, qrStartToken, qrStartSecret
	 * @throws org.springframework.web.client.HttpStatusCodeException if the API call
	 * fails
	 */
	public BankIdSignResponse sign(BankIdSignRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.SIGN.getEndpoint();
		log.debug("BankID {} request to {}", BankIdOperation.SIGN.getEndpoint(), url);

		HttpEntity<BankIdSignRequest> entity = new HttpEntity<>(request, createHeaders());
		ResponseEntity<BankIdSignResponse> response = restTemplate.postForEntity(url, entity, BankIdSignResponse.class);

		BankIdSignResponse signBody = response.getBody();
		if (signBody == null) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_INITIATION_FAILED);
		}

		log.debug("BankID {} successful, orderRef={}", BankIdOperation.SIGN.getEndpoint(), signBody.getOrderRef());
		return signBody;
	}

	/**
	 * Collects the status of an ongoing signing order.
	 *
	 * <p>
	 * Calls POST /collect endpoint to poll for status updates. Should be called every 2
	 * seconds until status is "complete" or "failed".
	 * </p>
	 * @param request The collect request containing orderRef
	 * @return Response containing status, hintCode, and completionData (if complete)
	 * @throws org.springframework.web.client.HttpStatusCodeException if the API call
	 * fails
	 */
	public BankIdCollectResponse collect(BankIdCollectRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.COLLECT.getEndpoint();
		log.debug("BankID {} request for orderRef={}", BankIdOperation.COLLECT.getEndpoint(), request.getOrderRef());

		HttpEntity<BankIdCollectRequest> entity = new HttpEntity<>(request, createHeaders());
		ResponseEntity<BankIdCollectResponse> response = restTemplate.postForEntity(url, entity,
				BankIdCollectResponse.class);

		BankIdCollectResponse body = response.getBody();
		if (body == null) {
			throw new ModuleException(EidMessageConstant.EID_ERROR_PROVIDER_STATUS_CHECK_FAILED);
		}
		log.debug("BankID {} response: status={}, hintCode={}", BankIdOperation.COLLECT.getEndpoint(), body.getStatus(),
				body.getHintCode());
		return body;
	}

	/**
	 * Cancels an ongoing signing order.
	 *
	 * <p>
	 * Calls POST /cancel endpoint to cancel an order. Should be used when the user wants
	 * to cancel or when the RP no longer needs the order.
	 * </p>
	 * @param request The cancel request containing orderRef
	 * @throws org.springframework.web.client.HttpStatusCodeException if the API call
	 * fails
	 */
	public void cancel(BankIdCancelRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.CANCEL.getEndpoint();
		log.debug("BankID {} request for orderRef={}", BankIdOperation.CANCEL.getEndpoint(), request.getOrderRef());

		restTemplate.postForEntity(url, new HttpEntity<>(request, createHeaders()), Void.class);
		log.debug("BankID {} successful for orderRef={}", BankIdOperation.CANCEL.getEndpoint(), request.getOrderRef());
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

}
