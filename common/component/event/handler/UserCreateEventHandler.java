package com.skapp.enterprise.common.component.event.handler;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserCreatedEvent;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.type.UserType;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserCreateEventHandler {

	private final AddressBookDao addressBookDao;

	public UserCreateEventHandler(AddressBookDao addressBookDao) {
		this.addressBookDao = addressBookDao;
	}

	@EventListener
	public void handleUserCreated(UserCreatedEvent event) {
		User user = event.getUser();

		AddressBook addressBook = new AddressBook();
		addressBook.setInternalUser(user);
		addressBook.setType(UserType.INTERNAL);
		addressBookDao.save(addressBook);
	}

}
