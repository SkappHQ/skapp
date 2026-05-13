package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.EmailService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.type.EpEmailBodyTemplates;
import com.skapp.enterprise.common.type.EpEmailButtonText;
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
		emailDynamicFields.setOtp(otp);

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_NO_BUTTON_V1,
				EpEmailBodyTemplates.GUEST_MODULE_EMAIL_VERIFY, emailDynamicFields, emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendGuestUserInvitationEmail(Employee employee, String invitationLink, String adminName,
			String projectNames) {
		GuestUserEmailDynamicFields emailDynamicFields = new GuestUserEmailDynamicFields();
		emailDynamicFields.setRecipientName(employee.getFirstName());
		emailDynamicFields.setWorkEmail(employee.getUser().getEmail());
		emailDynamicFields.setAdminName(adminName);
		emailDynamicFields.setTenantId(TenantContext.getCurrentTenant());
		emailDynamicFields.setProjectNames(projectNames);
		emailDynamicFields.setAppUrl(invitationLink);

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_GUEST_V1,
				EpEmailBodyTemplates.GUEST_MODULE_INVITATION, emailDynamicFields, emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendGuestUserRequestApprovedEmail(Employee employee, String projectName) {
		GuestUserEmailDynamicFields emailDynamicFields = new GuestUserEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(employee.getFirstName());
		emailDynamicFields.setWorkEmail(employee.getUser().getEmail());
		emailDynamicFields.setProjectName(projectName);
		emailDynamicFields.setButtonText(EpEmailButtonText.GO_TO_PROJECT.name());
		emailDynamicFields.setAppUrl("https://" + TenantContext.getCurrentTenant() + ".skapp.com");

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.GUEST_MODULE_REQUEST_APPROVED, emailDynamicFields,
				emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendGuestUserRequestDeclinedEmail(Employee employee, String projectName) {
		GuestUserEmailDynamicFields emailDynamicFields = new GuestUserEmailDynamicFields();
		emailDynamicFields.setEmployeeOrManagerName(employee.getFirstName());
		emailDynamicFields.setWorkEmail(employee.getUser().getEmail());
		emailDynamicFields.setProjectName(projectName);
		emailDynamicFields.setButtonText(EpEmailButtonText.GO_TO_PROJECT.name());
		emailDynamicFields.setAppUrl("https://" + TenantContext.getCurrentTenant() + ".skapp.com");

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.GUEST_MODULE_REQUEST_DECLINED, emailDynamicFields,
				emailDynamicFields.getWorkEmail());
	}

	@Override
	public void sendGuestUserRequestAwaitingApprovalEmail(String approverEmail, String approverName, String projectName,
			String requesterName) {
		GuestUserEmailDynamicFields emailDynamicFields = new GuestUserEmailDynamicFields();
		emailDynamicFields.setWorkEmail(approverEmail);
		emailDynamicFields.setEmployeeOrManagerName(approverName);
		emailDynamicFields.setProjectName(projectName);
		emailDynamicFields.setAdminName(requesterName);
		emailDynamicFields.setAppUrl("https://" + TenantContext.getCurrentTenant() + ".skapp.com");

		emailService.sendEmail(EpEmailMainTemplates.MAIN_TEMPLATE_V1,
				EpEmailBodyTemplates.GUEST_MODULE_REQUEST_AWAITING_APPROVAL, emailDynamicFields, approverEmail);
	}

}
