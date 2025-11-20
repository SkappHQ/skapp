package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.enterprise.people.service.EpUserEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpUserEmailServiceImpl implements EpUserEmailService {

	private final EmailService emailService;

	@Override
	public void sendGuestUserOtpEmail(User user, String otp) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(user.getEmployee().getFirstName());
		emailDynamicFields.setWorkEmail(user.getEmail());
		emailDynamicFields.setTenantUrl(otp);

		emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_USER_INVITATION_GOOGLE_SSO, emailDynamicFields,
				emailDynamicFields.getWorkEmail());
	}

}
