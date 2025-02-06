package com.skapp.enterprise.common.service;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarConsentUrlDto;

public interface EpGoogleCalenderService {

	String connectGoogleCalendar(EpGoogleCalendarAuthRedirectDto epGoogleCalendarauthRedirectDto);

	ResponseEntityDto isGoogleCalendarConnected();

	ResponseEntityDto getGoogleAuthUrl(EpGoogleCalendarConsentUrlDto epGoogleCalendarConsentUrlDto);

	ResponseEntityDto disconnectGoogleCalendar();

	String generateAccessToken(User user);

}
