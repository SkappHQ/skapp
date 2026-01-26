package com.skapp.enterprise.common.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import lombok.NonNull;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

import java.net.InetAddress;
import java.net.URI;

@Slf4j
@UtilityClass
public class Validation {

	public static void validateFrontendUrl(@NonNull String url) throws ModuleException {
		try {
			new URI(url);
		}
		catch (Exception e) {
			log.error("validateUrl: url is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_INVALID_ORGANIZATION_URL);
		}
	}

	public static void validateGoogleAuthRedirectDto(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		if (epGoogleAuthRedirectDto.getError() != null && !epGoogleAuthRedirectDto.getError().isEmpty()
				|| epGoogleAuthRedirectDto.getCode().isEmpty()) {
			log.error("connectGoogleCalendar: Error: {}", epGoogleAuthRedirectDto.getError());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

	public static boolean isValidFilePath(String filePath) {
		return filePath != null && !filePath.isEmpty() && !filePath.contains("..");
	}

	public static boolean isValidIpAddress(String ip) {
		if (ip == null || ip.isEmpty()) {
			return false;
		}
		try {
			InetAddress.getByName(ip);
			return true;
		}
		catch (Exception e) {
			return false;
		}
	}

}
