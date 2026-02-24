package com.skapp.community.common.component;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.payload.response.ErrorResponse;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExceptionLoggingFilter implements Filter {

	private static final String RED_COLOR = "\u001B[31m";

	private static final String RESET_COLOR = "\u001B[0m";

	private final JsonMapper objectMapper;

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException {
		try {
			chain.doFilter(request, response);
		}
		catch (Exception e) {
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			HttpServletResponse httpResponse = (HttpServletResponse) response;

			logDetailedException(e, httpRequest);
			handleException(e, httpResponse);
		}
	}

	private void handleException(Exception e, HttpServletResponse response) throws IOException {
		HttpStatus status;
		CommonMessageConstant messageKey;
		String message;

		switch (e) {
			case ServletException servletException -> {
				status = HttpStatus.BAD_REQUEST;
				messageKey = CommonMessageConstant.COMMON_ERROR_SERVLET_EXCEPTION;
				message = servletException.getMessage();
			}
			case IOException ioException -> {
				status = HttpStatus.INTERNAL_SERVER_ERROR;
				messageKey = CommonMessageConstant.COMMON_ERROR_IO_EXCEPTION;
				message = ioException.getMessage();
			}
			case AuthenticationException authenticationException -> {
				status = HttpStatus.UNAUTHORIZED;
				messageKey = (CommonMessageConstant) authenticationException.getMessageKey();
				message = authenticationException.getMessage();
			}
			case null, default -> {
				status = HttpStatus.NOT_FOUND;
				messageKey = CommonMessageConstant.COMMON_ERROR_MODULE_EXCEPTION;
				message = e != null ? e.getMessage() : null;
			}
		}

		ErrorResponse errorResponse = new ErrorResponse(status, message, messageKey);
		ResponseEntityDto responseDto = new ResponseEntityDto(true, errorResponse);

		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.getWriter().write(objectMapper.writeValueAsString(responseDto));
	}

	private void logDetailedException(Exception e, HttpServletRequest request) {
		String errorLog = "\n" + RED_COLOR + "==================== Filter Exception Occurred ====================\n"
				+ String.format("Method:              %s%n", request.getMethod())
				+ String.format("API Path:            %s%n", request.getRequestURI())
				+ String.format("Exception Type:      %s%n", e.getClass().getSimpleName())
				+ String.format("Message:             %s%n", e.getMessage())
				+ String.format("Stack Trace:         %n    %s%n",
						Arrays.stream(e.getStackTrace())
							.limit(5)
							.map(StackTraceElement::toString)
							.collect(Collectors.joining("\n    ")))
				+ "======================================================================" + RESET_COLOR;

		log.error(errorLog);
	}

}
