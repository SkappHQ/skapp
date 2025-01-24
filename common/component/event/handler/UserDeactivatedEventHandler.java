package com.skapp.enterprise.common.component.event.handler;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserDeactivatedEventHandler {

	private final AddressBookDao addressBookDao;

	@Autowired
	public UserDeactivatedEventHandler(AddressBookDao addressBookDao) {
		this.addressBookDao = addressBookDao;
	}

	@EventListener
	public void handleUserDeactivation(UserDeactivatedEvent event) {
		User user = event.getUser();
		addressBookDao.deleteByInternalUserUserId(user.getUserId());

	}

}
