package com.skapp.enterprise.esignature.eid.bankid.exception;

import com.skapp.enterprise.esignature.eid.bankid.dto.BankIdErrorResponse;
import com.skapp.enterprise.esignature.type.BankIdOperation;
import lombok.Getter;

/**
 * Exception thrown when BankID API calls fail.
 *
 * <p>
 * Carries the BankID-specific error response for detailed error handling at the provider
 * layer.
 * </p>
 */
@Getter
public class BankIdApiException extends RuntimeException {

	private final transient BankIdErrorResponse errorResponse;

	private final BankIdOperation operation;

	public BankIdApiException(String message, BankIdOperation operation, BankIdErrorResponse errorResponse) {
		super(message);
		this.operation = operation;
		this.errorResponse = errorResponse;
	}

	public BankIdApiException(String message, BankIdOperation operation, BankIdErrorResponse errorResponse,
			Throwable cause) {
		super(message, cause);
		this.operation = operation;
		this.errorResponse = errorResponse;
	}

	/**
	 * Gets the BankID error code from the error response.
	 * @return the error code, or null if no error response is available
	 */
	public String getErrorCode() {
		return errorResponse != null ? errorResponse.getErrorCode() : null;
	}

	/**
	 * Gets the BankID error details from the error response.
	 * @return the error details, or null if no error response is available
	 */
	public String getErrorDetails() {
		return errorResponse != null ? errorResponse.getDetails() : null;
	}

}
