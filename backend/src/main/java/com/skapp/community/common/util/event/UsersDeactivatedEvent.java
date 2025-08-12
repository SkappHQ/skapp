package com.skapp.community.common.util.event;

import com.skapp.community.common.model.User;

import java.util.List;

public class UsersDeactivatedEvent extends UsersEvent {

	public UsersDeactivatedEvent(Object source, List<User> users) {
		super(source, users);
	}

}
