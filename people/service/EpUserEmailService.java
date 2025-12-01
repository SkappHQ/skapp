package com.skapp.enterprise.people.service;

import com.skapp.community.common.model.User;

public interface EpUserEmailService {

	void sendGuestUserOtpEmail(User user, String otp);

	void sendGuestUserInvitationEmail(User user, String invitationLink, String adminName, String projectNames);

}
