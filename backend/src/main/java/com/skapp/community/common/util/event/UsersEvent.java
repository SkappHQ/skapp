package com.skapp.community.common.util.event;

import com.skapp.community.common.model.User;
import org.springframework.context.ApplicationEvent;

import java.util.List;

public abstract class UsersEvent extends ApplicationEvent {

	private final transient List<User> users;

	protected UsersEvent(Object source, List<User> users) {
		super(source);
		this.users = users;
	}

	public List<User> getUsers() {
		return users;
	}

}
