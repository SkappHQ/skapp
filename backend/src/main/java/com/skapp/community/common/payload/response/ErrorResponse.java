package com.skapp.community.common.payload.response;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
public class ErrorResponse {

	private LocalDateTime timestamp;

	private int code;

	private String status;

	private String messageKey;

	private String message;

	private List<ValidationError> errors;

	public ErrorResponse() {
		this.timestamp = LocalDateTime.now();
	}

	public ErrorResponse(HttpStatus httpStatus, String message, MessageConstant messageKey) {
		this();
		this.code = httpStatus.value();
		this.status = httpStatus.name();
		this.messageKey = messageKey != null ? messageKey.name() : null;
		this.message = message;
	}

	public void addValidationError(String field, String message) {
		if (Objects.isNull(errors)) {
			errors = new ArrayList<>();
		}
		errors.add(new ValidationError(field, message));
	}

	private record ValidationError(String field, String message) {
	}

}
