package com.skapp.enterprise.people.service;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.model.Employee;

public interface EpUserEmailService {

	void sendGuestUserOtpEmail(User user, String otp);

	void sendGuestUserInvitationEmail(Employee employee, String invitationLink, String adminName, String projectNames);

}
