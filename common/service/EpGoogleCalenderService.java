package com.skapp.enterprise.common.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;

import java.time.LocalDateTime;

public interface EpGoogleCalenderService {

	String connectGoogleCalendar(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto);

	ResponseEntityDto saveGoogleCalendarConfig(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto);

	ResponseEntityDto isGoogleCalendarConnected();

	ResponseEntityDto getGoogleAuthUrl(EpGoogleConsentUrlDto epGoogleConsentUrlDto);

	ResponseEntityDto disconnectGoogleCalendar();

	String generateGoogleAccessToken(User user);

	String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage);

	void deleteOutOfOfficeEvent(String eventId, String accessToken);

	void setupOrganizationCalendar();

}
