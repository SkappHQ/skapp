package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;

import java.util.List;

public interface CrmContactOwnerReassignmentService {

	void reassignContactsOwnedByDeactivatedUsers(List<User> users);

}
