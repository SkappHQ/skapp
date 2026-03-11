package com.skapp.community.common.component;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.payload.response.ErrorResponse;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.ExceptionLogFormatter;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class ExceptionLoggingFilter implements Filter {

	private final JsonMapper objectMapper;

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException {
		try {
			chain.doFilter(request, response);
		}
		catch (Exception e) {
			HttpServletRequest httpRequest = (HttpServletRequest) request;
			HttpServletResponse httpResponse = (HttpServletResponse) response;

			logException(e, httpRequest);
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

	private void logException(Exception e, HttpServletRequest request) {
		String errorLog = ExceptionLogFormatter.format("Filter Exception", request.getMethod(), request.getRequestURI(),
				e, null, null);
		log.error(errorLog);
	}

}
