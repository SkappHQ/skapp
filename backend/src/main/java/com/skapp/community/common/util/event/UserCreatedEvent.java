package com.skapp.community.common.util.event;

import com.skapp.community.common.model.User;

public class UserCreatedEvent extends UserEvent {

	public UserCreatedEvent(Object source, User user) {
		super(source, user);
	}

}
