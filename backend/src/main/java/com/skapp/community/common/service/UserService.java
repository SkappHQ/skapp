package com.skapp.community.common.service;

import com.skapp.community.common.model.User;

import java.util.Set;

public interface UserService {

	User getCurrentUser();

	Set<String> getCurrentUserRoles();

}
