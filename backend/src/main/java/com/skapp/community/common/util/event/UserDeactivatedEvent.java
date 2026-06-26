package com.skapp.community.common.util.event;

import com.skapp.community.common.model.User;

public class UserDeactivatedEvent extends UserEvent {

	public UserDeactivatedEvent(Object source, User user) {
		super(source, user);
	}

}
