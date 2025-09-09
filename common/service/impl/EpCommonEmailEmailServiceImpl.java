package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.service.EpCommonEmailService;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailMainTemplates;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EpCommonEmailEmailServiceImpl implements EpCommonEmailService {

	private final EmailService emailService;

	@Override
	public void sendSuperAdminVerifyOtpEmail(SuperAdmin superAdmin, String otp) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(superAdmin.getFirstName() + " " + superAdmin.getLastName());
		emailDynamicFields.setWorkEmail(superAdmin.getEmail());
		emailDynamicFields.setOtp(otp);

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_NO_BUTTON_V1,
				EpEmailBodyTemplates.COMMON_MODULE_EMAIL_VERIFY, emailDynamicFields, emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendTenantUrlEmail(SuperAdmin superAdmin, String tenantId, String organizationName) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(superAdmin.getFirstName() + " " + superAdmin.getLastName());
		emailDynamicFields.setOrganizationName(organizationName);
		emailDynamicFields.setWorkEmail(superAdmin.getEmail());
		emailDynamicFields.setTenantUrl("https://" + tenantId + ".skapp.com/signin");
		emailDynamicFields.setAppUrl("https://" + tenantId + ".skapp.com/signin");

		LoginMethod loginMethod = superAdmin.getLoginMethod();

		if (loginMethod == LoginMethod.GOOGLE) {
			emailService.sendEmail(EpEmailBodyTemplates.COMMON_MODULE_GOOGLE_SSO_CREATION_TENANT_URL,
					emailDynamicFields, emailDynamicFields.getWorkEmail());
		}

		else if (loginMethod == LoginMethod.MICROSOFT) {
			emailService.sendEmail(EpEmailBodyTemplates.COMMON_MODULE_MICROSOFT_SSO_CREATION_TENANT_URL,
					emailDynamicFields, emailDynamicFields.getWorkEmail());
		}

		else if (loginMethod == LoginMethod.CREDENTIALS) {
			emailService.sendEmail(EpEmailBodyTemplates.COMMON_MODULE_CREDENTIAL_BASED_CREATION_TENANT_URL,
					emailDynamicFields, emailDynamicFields.getWorkEmail());
		}

	}

	@Override
	public void sendPasswordResetOtpEmail(User user, String otp) {
		PeopleEmailDynamicFields emailDynamicFields = new PeopleEmailDynamicFields();
		emailDynamicFields
			.setEmployeeOrManagerName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
		emailDynamicFields.setWorkEmail(user.getEmail());
		emailDynamicFields.setOtp(otp);

		emailService.sendEmail(EpEmailBodyTemplates.COMMON_MODULE_PASSWORD_RESET_OTP, emailDynamicFields,
				emailDynamicFields.getWorkEmail());
	}

}
