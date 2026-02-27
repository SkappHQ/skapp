package com.skapp.enterprise.esignature.eid.bankid;

import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdAuthRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCancelRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdErrorResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignResponse;
import com.skapp.enterprise.esignature.eid.bankid.exception.BankIdApiException;
import com.skapp.enterprise.esignature.eid.config.BankIdProperties;
import com.skapp.enterprise.esignature.type.BankIdOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
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
	 * @throws BankIdApiException if the API call fails
	 */
	public BankIdSignResponse auth(BankIdAuthRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.AUTH.getEndpoint();
		log.debug("BankID {} request to {}", BankIdOperation.AUTH.getEndpoint(), url);

		try {
			HttpEntity<BankIdAuthRequest> entity = new HttpEntity<>(request, createHeaders());
			ResponseEntity<BankIdSignResponse> response = restTemplate.postForEntity(url, entity,
					BankIdSignResponse.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				log.debug("BankID {} successful, orderRef={}", BankIdOperation.AUTH.getEndpoint(),
						response.getBody().getOrderRef());
				return response.getBody();
			}

			throw new BankIdApiException("Unexpected response from BankID " + BankIdOperation.AUTH.getEndpoint(),
					BankIdOperation.AUTH, null);

		}
		catch (HttpStatusCodeException e) {
			throw new BankIdApiException("BankID " + BankIdOperation.AUTH.getEndpoint() + " failed: " + e.getMessage(),
					BankIdOperation.AUTH, extractErrorResponse(e));
		}
	}

	/**
	 * Initiates a signing order with BankID.
	 *
	 * <p>
	 * Calls POST /sign endpoint with user IP and the data to be signed.
	 * </p>
	 * @param request The sign request containing endUserIp, userVisibleData, etc.
	 * @return Response containing orderRef, autoStartToken, qrStartToken, qrStartSecret
	 * @throws BankIdApiException if the API call fails
	 */
	public BankIdSignResponse sign(BankIdSignRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.SIGN.getEndpoint();
		log.debug("BankID {} request to {}", BankIdOperation.SIGN.getEndpoint(), url);

		try {
			HttpEntity<BankIdSignRequest> entity = new HttpEntity<>(request, createHeaders());
			ResponseEntity<BankIdSignResponse> response = restTemplate.postForEntity(url, entity,
					BankIdSignResponse.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				log.debug("BankID {} successful, orderRef={}", BankIdOperation.SIGN.getEndpoint(),
						response.getBody().getOrderRef());
				return response.getBody();
			}

			throw new BankIdApiException("Unexpected response from BankID " + BankIdOperation.SIGN.getEndpoint(),
					BankIdOperation.SIGN, null);

		}
		catch (HttpStatusCodeException e) {
			throw new BankIdApiException("BankID " + BankIdOperation.SIGN.getEndpoint() + " failed: " + e.getMessage(),
					BankIdOperation.SIGN, extractErrorResponse(e));
		}
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
	 * @throws BankIdApiException if the API call fails
	 */
	public BankIdCollectResponse collect(BankIdCollectRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.COLLECT.getEndpoint();
		log.debug("BankID {} request for orderRef={}", BankIdOperation.COLLECT.getEndpoint(), request.getOrderRef());

		try {
			HttpEntity<BankIdCollectRequest> entity = new HttpEntity<>(request, createHeaders());
			ResponseEntity<BankIdCollectResponse> response = restTemplate.postForEntity(url, entity,
					BankIdCollectResponse.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				BankIdCollectResponse body = response.getBody();
				log.debug("BankID {} response: status={}, hintCode={}", BankIdOperation.COLLECT.getEndpoint(),
						body.getStatus(), body.getHintCode());
				return body;
			}

			throw new BankIdApiException("Unexpected response from BankID " + BankIdOperation.COLLECT.getEndpoint(),
					BankIdOperation.COLLECT, null);

		}
		catch (HttpStatusCodeException e) {
			throw new BankIdApiException(
					"BankID " + BankIdOperation.COLLECT.getEndpoint() + " failed: " + e.getMessage(),
					BankIdOperation.COLLECT, extractErrorResponse(e));
		}
	}

	/**
	 * Cancels an ongoing signing order.
	 *
	 * <p>
	 * Calls POST /cancel endpoint to cancel an order. Should be used when the user wants
	 * to cancel or when the RP no longer needs the order.
	 * </p>
	 * @param request The cancel request containing orderRef
	 * @throws BankIdApiException if the API call fails
	 */
	public void cancel(BankIdCancelRequest request) {
		String url = bankIdProperties.getApiBaseUrl() + BankIdOperation.CANCEL.getEndpoint();
		log.debug("BankID {} request for orderRef={}", BankIdOperation.CANCEL.getEndpoint(), request.getOrderRef());

		try {
			HttpEntity<BankIdCancelRequest> entity = new HttpEntity<>(request, createHeaders());
			restTemplate.postForEntity(url, entity, Void.class);
			log.debug("BankID {} successful for orderRef={}", BankIdOperation.CANCEL.getEndpoint(),
					request.getOrderRef());

		}
		catch (HttpStatusCodeException e) {
			throw new BankIdApiException(
					"BankID " + BankIdOperation.CANCEL.getEndpoint() + " failed: " + e.getMessage(),
					BankIdOperation.CANCEL, extractErrorResponse(e));
		}
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	private BankIdErrorResponse extractErrorResponse(HttpStatusCodeException e) {
		try {
			return e.getResponseBodyAs(BankIdErrorResponse.class);
		}
		catch (Exception ex) {
			return null;
		}
	}

}
