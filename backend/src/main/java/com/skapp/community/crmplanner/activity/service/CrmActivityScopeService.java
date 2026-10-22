package com.skapp.community.crmplanner.activity.service;

import com.skapp.community.common.model.User;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;

public interface CrmActivityScopeService {

	CrmActivityScope resolveScope(User user);

}
