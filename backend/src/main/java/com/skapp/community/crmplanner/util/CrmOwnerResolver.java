package com.skapp.community.crmplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CrmOwnerResolver {

	public static Employee resolveOwner(Long ownerId, User currentUser, EmployeeDao employeeDao) {
		Employee currentEmployee = currentUser.getEmployee();

		Role currentCrmRole = currentEmployee.getEmployeeRole().getCrmRole();

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE) {
			if (!currentEmployee.getEmployeeId().equals(ownerId)) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
			}
			return currentEmployee;
		}

		return validateAssignableOwner(ownerId, employeeDao);
	}

	private static Employee validateAssignableOwner(Long ownerId, EmployeeDao employeeDao) {
		Employee owner = employeeDao.findEmployeeByEmployeeIdAndUserIsActiveTrue(ownerId);

		if (owner == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND);
		}

		if (!CrmConstants.ASSIGNABLE_CRM_ROLES.contains(owner.getEmployeeRole().getCrmRole())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

}
