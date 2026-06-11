package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.service.CrmOwnerResolverService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrmOwnerResolverServiceImpl implements CrmOwnerResolverService {

	private final EmployeeDao employeeDao;

	@Override
	public Employee resolveOwner(Long ownerId, User currentUser) {
		Employee currentEmployee = currentUser.getEmployee();

		if (CrmUtil.isCrmSalesRepresentative(currentUser)) {
			return currentEmployee;
		}

		return validateAssignableOwner(ownerId);
	}

	private Employee validateAssignableOwner(Long ownerId) {
		Employee owner = employeeDao.findEmployeeByEmployeeIdAndUserIsActiveTrue(ownerId);

		if (owner == null || !CrmConstants.ASSIGNABLE_CRM_ROLES.contains(owner.getEmployeeRole().getCrmRole())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE);
		}

		return owner;
	}

}
