package com.skapp.enterprise.common.component.event.handler;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.community.common.util.event.UsersDeactivatedEvent;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

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
		addressBookDao.findByInternalUser(user).ifPresent(addressBook -> {
			addressBook.setIsActive(false);
			addressBookDao.save(addressBook);
		});
	}

	@EventListener
	public void handleUsersDeactivation(UsersDeactivatedEvent event) {
		List<User> users = event.getUsers();
		List<AddressBook> addressBooks = addressBookDao.findByInternalUserIn(users);

		for (AddressBook addressBook : addressBooks) {
			addressBook.setIsActive(false);
		}

		if (!addressBooks.isEmpty()) {
			addressBookDao.saveAll(addressBooks);
		}
	}

}
