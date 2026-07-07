package com.skapp.community.common.util.event;

import com.skapp.community.common.model.User;

public class UserReactivatedEvent extends UserEvent {

	public UserReactivatedEvent(Object source, User user) {
		super(source, user);
	}

}
