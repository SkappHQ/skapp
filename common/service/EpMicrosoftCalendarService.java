package com.skapp.enterprise.common.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftConsentUrlDto;

import java.time.LocalDateTime;

public interface EpMicrosoftCalendarService {

	void setupOrganizationCalendar();

	String connectMicrosoftCalendar(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto);

	ResponseEntityDto saveMicrosoftCalendarConfig(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto);

	ResponseEntityDto isMicrosoftCalendarConnected();

	Boolean getIsMicrosoftCalendarConnected();

	ResponseEntityDto getMicrosoftAuthUrl(EpMicrosoftConsentUrlDto epMicrosoftConsentUrlDto);

	ResponseEntityDto disconnectMicrosoftCalendar();

	String generateMicrosoftAccessToken(User user);

	String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage);

	void deleteOutOfOfficeEvent(String eventId, String accessToken);

}
