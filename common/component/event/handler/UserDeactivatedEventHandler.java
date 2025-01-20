package com.skapp.enterprise.common.component.event.handler;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.enterprise.esignature.repository.AddressBookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserDeactivatedEventHandler {

	private final AddressBookRepository addressBookRepository;

	@Autowired
	public UserDeactivatedEventHandler(AddressBookRepository addressBookRepository) {
		this.addressBookRepository = addressBookRepository;
	}

	@EventListener
	public void handleUserDeactivation(UserDeactivatedEvent event) {
		User user = event.getUser();
		addressBookRepository.deleteByInternalUserUserId(user.getUserId());

	}

}
