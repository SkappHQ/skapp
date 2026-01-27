package com.skapp.enterprise.esignature.eid.bankid;

import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCancelRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdCollectResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdErrorResponse;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignRequest;
import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdSignResponse;
import com.skapp.enterprise.esignature.eid.config.BankIdProperties;
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
 * Provides methods to call BankID /sign, /collect, and /cancel endpoints. Uses a
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
		String url = bankIdProperties.getApiBaseUrl() + "/sign";
		log.debug("BankID /sign request to {}", url);

		try {
			HttpEntity<BankIdSignRequest> entity = new HttpEntity<>(request, createHeaders());
			ResponseEntity<BankIdSignResponse> response = restTemplate.postForEntity(url, entity,
					BankIdSignResponse.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				log.debug("BankID /sign successful, orderRef={}", response.getBody().getOrderRef());
				return response.getBody();
			}

			throw new BankIdApiException("Unexpected response from BankID /sign", null);

		}
		catch (HttpStatusCodeException e) {
			handleApiError("sign", e);
			throw new BankIdApiException("BankID /sign failed: " + e.getMessage(), extractErrorResponse(e));
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
		String url = bankIdProperties.getApiBaseUrl() + "/collect";
		log.debug("BankID /collect request for orderRef={}", request.getOrderRef());

		try {
			HttpEntity<BankIdCollectRequest> entity = new HttpEntity<>(request, createHeaders());
			ResponseEntity<BankIdCollectResponse> response = restTemplate.postForEntity(url, entity,
					BankIdCollectResponse.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				BankIdCollectResponse body = response.getBody();
				log.debug("BankID /collect response: status={}, hintCode={}", body.getStatus(), body.getHintCode());
				return body;
			}

			throw new BankIdApiException("Unexpected response from BankID /collect", null);

		}
		catch (HttpStatusCodeException e) {
			handleApiError("collect", e);
			throw new BankIdApiException("BankID /collect failed: " + e.getMessage(), extractErrorResponse(e));
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
		String url = bankIdProperties.getApiBaseUrl() + "/cancel";
		log.debug("BankID /cancel request for orderRef={}", request.getOrderRef());

		try {
			HttpEntity<BankIdCancelRequest> entity = new HttpEntity<>(request, createHeaders());
			restTemplate.postForEntity(url, entity, Void.class);
			log.debug("BankID /cancel successful for orderRef={}", request.getOrderRef());

		}
		catch (HttpStatusCodeException e) {
			// 404 is acceptable for cancel - order may have already expired
			if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
				log.debug("BankID /cancel returned 404 - order already expired or cancelled");
				return;
			}
			handleApiError("cancel", e);
			throw new BankIdApiException("BankID /cancel failed: " + e.getMessage(), extractErrorResponse(e));
		}
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	private void handleApiError(String operation, HttpStatusCodeException e) {
		BankIdErrorResponse error = extractErrorResponse(e);
		if (error != null && error.getErrorCode() != null) {
			log.warn("BankID /{} failed: errorCode={}, details={}", operation, error.getErrorCode(),
					error.getDetails());
		}
		else {
			log.warn("BankID /{} failed: status={}, body={}", operation, e.getStatusCode(),
					e.getResponseBodyAsString());
		}
	}

	private BankIdErrorResponse extractErrorResponse(HttpStatusCodeException e) {
		try {
			return e.getResponseBodyAs(BankIdErrorResponse.class);
		}
		catch (Exception ex) {
			return null;
		}
	}

	/**
	 * Exception thrown when BankID API call fails.
	 */
	public static class BankIdApiException extends RuntimeException {

		private final BankIdErrorResponse errorResponse;

		public BankIdApiException(String message, BankIdErrorResponse errorResponse) {
			super(message);
			this.errorResponse = errorResponse;
		}

		public BankIdErrorResponse getErrorResponse() {
			return errorResponse;
		}

		public String getErrorCode() {
			return errorResponse != null ? errorResponse.getErrorCode() : null;
		}

	}

}
