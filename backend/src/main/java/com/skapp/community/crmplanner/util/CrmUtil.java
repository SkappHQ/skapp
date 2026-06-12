package com.skapp.community.crmplanner.util;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CrmUtil {

	public boolean isCrmSalesRepresentative(User user) {
		return user.getEmployee().getEmployeeRole().getCrmRole() == Role.CRM_SALES_REPRESENTATIVE;
	}

}
