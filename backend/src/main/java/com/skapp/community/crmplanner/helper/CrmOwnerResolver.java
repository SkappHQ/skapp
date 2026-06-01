package com.skapp.community.crmplanner.helper;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Resolves and authorizes the CRM owner that may be assigned to a CRM resource (contact,
 * task, etc.), applying the role-based assignment rules shared across CRM features.
 */
@Component
@RequiredArgsConstructor
public class CrmOwnerResolver {

	private final EmployeeDao employeeDao;

	public Employee resolveOwner(Long ownerId, User currentUser) {
		Employee currentEmployee = currentUser.getEmployee();
		if (currentEmployee == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND);
		}

		EmployeeRole currentEmployeeRole = currentEmployee.getEmployeeRole();
		boolean isSuperAdmin = currentEmployeeRole != null
				&& Boolean.TRUE.equals(currentEmployeeRole.getIsSuperAdmin());
		Role currentCrmRole = currentEmployeeRole != null ? currentEmployeeRole.getCrmRole() : null;

		if (currentCrmRole == Role.CRM_SALES_REPRESENTATIVE && !isSuperAdmin) {
			if (!ownerId.equals(currentEmployee.getEmployeeId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
			}
			return currentEmployee;
		}

		if (!isSuperAdmin && currentCrmRole != Role.CRM_ADMIN && currentCrmRole != Role.CRM_SALES_MANAGER) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED);
		}

		return validateAssignableOwner(ownerId);
	}

	private Employee validateAssignableOwner(Long ownerId) {
		Employee owner = employeeDao.findById(ownerId)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND));

		if (owner.getUser() == null || !Boolean.TRUE.equals(owner.getUser().getIsActive())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INACTIVE);
		}

		EmployeeRole ownerRole = owner.getEmployeeRole();
		boolean isOwnerSuperAdmin = ownerRole != null && Boolean.TRUE.equals(ownerRole.getIsSuperAdmin());
		Role ownerCrmRole = ownerRole != null ? ownerRole.getCrmRole() : null;
		if (!isOwnerSuperAdmin && !CrmConstants.ASSIGNABLE_CRM_ROLES.contains(ownerCrmRole)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

}
