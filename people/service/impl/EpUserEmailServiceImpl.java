package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import com.skapp.enterprise.people.payload.email.GuestUserEmailDynamicFields;
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

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_NO_BUTTON_V1,
				EpEmailBodyTemplates.GUEST_MODULE_EMAIL_VERIFY, emailDynamicFields, emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendGuestUserInvitationEmail(User user, String invitationLink, String adminName, String projectNames) {
		GuestUserEmailDynamicFields emailDynamicFields = new GuestUserEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(user.getEmployee().getFirstName());
		emailDynamicFields.setWorkEmail(user.getEmail());
		emailDynamicFields.setAdminName(adminName);
		emailDynamicFields.setTenantId(TenantContext.getCurrentTenant());
		emailDynamicFields.setProjectNames(projectNames);
		emailDynamicFields.setAppUrl(invitationLink);

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_GUEST_V1,
				EpEmailBodyTemplates.GUEST_MODULE_INVITATION, emailDynamicFields, emailDynamicFields.getWorkEmail());
	}

}
