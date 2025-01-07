package com.skapp.enterprise.common.service;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.common.model.master.SuperAdmin;

public interface EpCommonEmailService {

	void sendSuperAdminVerifyOtpEmail(SuperAdmin superAdmin, String otp);

	void sendTenantUrlEmail(SuperAdmin superAdmin, String tenantId, String organizationName);

	void sendPasswordResetOtpEmail(User user, String otp);

}
