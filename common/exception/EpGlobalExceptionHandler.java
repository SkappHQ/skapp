package com.skapp.enterprise.common.exception;

import com.skapp.community.common.exception.GlobalExceptionHandler;
import com.skapp.community.common.payload.response.ErrorResponse;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.masterrepository.StripeLogDao;
import com.skapp.enterprise.common.model.master.StripeLog;
import com.skapp.enterprise.common.type.StripeLogStatus;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;

@Slf4j
@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class EpGlobalExceptionHandler extends GlobalExceptionHandler {

	private final StripeLogDao stripeLogDao;

	private final MessageUtil messageUtil;

	public EpGlobalExceptionHandler(MessageUtil messageUtil, HttpServletRequest request, StripeLogDao stripeLogDao) {
		super(messageUtil, request);
		this.stripeLogDao = stripeLogDao;
		this.messageUtil = messageUtil;
	}

	@ExceptionHandler(StripeVerificationException.class)
	public ResponseEntity<ResponseEntityDto> handleStripeVerificationException(StripeVerificationException e) {
		HttpStatus status = HttpStatus.BAD_REQUEST;

		StripeLog stripeLog = new StripeLog();
		stripeLog.setEventType(e.getEventType());
		stripeLog.setCreatedDate(Instant.now());
		stripeLog.setStripeEventId(e.getEvent().getId());
		stripeLog.setResponsePayload(e.getEvent().toJson());
		stripeLog.setStatus(StripeLogStatus.FAILED);
		stripeLog.setErrorMessage(e.getMessage());
		stripeLog.setCustomerId(e.getCustomerId());
		stripeLog.setCustomerName(e.getCustomerName());
		stripeLog.setTenantName(e.getTenantName());

		stripeLogDao.save(stripeLog);
		super.logDetailedException(e, e.getMessageKey().name(), messageUtil.getMessage(e.getMessageKey()), status);

		return new ResponseEntity<>(
				new ResponseEntityDto(true, new ErrorResponse(status, e.getMessage(), e.getMessageKey())), status);
	}

	@ExceptionHandler(StripeException.class)
	public ResponseEntity<ResponseEntityDto> handleStripeException(StripeException e) {
		HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
		String message = e.getMessage();

		logDetailedException(e, EPCommonMessageConstant.COMMON_ERROR_STRIPE_EXCEPTION.name(), message, status);

		return new ResponseEntity<>(
				new ResponseEntityDto(true,
						new ErrorResponse(status, message, EPCommonMessageConstant.COMMON_ERROR_STRIPE_EXCEPTION)),
				status);
	}

	@ExceptionHandler(TwilioApiException.class)
	public ResponseEntity<ResponseEntityDto> handleTwilioApiException(TwilioApiException e) {
		HttpStatus status = resolveTwilioStatus(e.getStatusCode());
		String message = messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_TWILIO_EXCEPTION);

		return new ResponseEntity<>(
				new ResponseEntityDto(true,
						new ErrorResponse(status, message, EPCommonMessageConstant.EP_COMMON_ERROR_TWILIO_EXCEPTION)),
				status);
	}

	private HttpStatus resolveTwilioStatus(int twilioHttpStatus) {
		return switch (twilioHttpStatus) {
			case 401 -> HttpStatus.UNAUTHORIZED; // Bad auth token / API key
			case 403 -> HttpStatus.FORBIDDEN; // Valid credentials but no permission
			case 404 -> HttpStatus.NOT_FOUND; // Invalid SID or resource not found
			case 429 -> HttpStatus.TOO_MANY_REQUESTS; // Rate limited by Twilio
			case 500, 503 -> HttpStatus.BAD_GATEWAY; // Twilio-side outage — not your
														// fault
			default -> HttpStatus.INTERNAL_SERVER_ERROR;
		};
	}

}
