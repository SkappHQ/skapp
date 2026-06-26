package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.model.Employee;

public interface CrmOwnerResolverService {

	Employee resolveOwner(Long ownerId, User currentUser);

}
