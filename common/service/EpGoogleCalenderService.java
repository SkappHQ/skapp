package com.skapp.enterprise.common.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarConsentUrlDto;

import java.time.LocalDateTime;

public interface EpGoogleCalenderService {

	String connectGoogleCalendar(EpGoogleCalendarAuthRedirectDto epGoogleCalendarauthRedirectDto);

	ResponseEntityDto isGoogleCalendarConnected();

	ResponseEntityDto getGoogleAuthUrl(EpGoogleCalendarConsentUrlDto epGoogleCalendarConsentUrlDto);

	ResponseEntityDto disconnectGoogleCalendar();

	String generateAccessToken(User user);

	String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage);

	void deleteOutOfOfficeEvent(String eventId, String accessToken);

}
