package com.skapp.enterprise.common.component.event.handler;

import com.skapp.community.common.model.User;
import com.skapp.community.common.util.event.UserCreatedEvent;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.repository.AddressBookRepository;
import com.skapp.enterprise.esignature.type.UserType;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class UserCreateEventHandler {

	private final AddressBookRepository addressBookRepository;

	public UserCreateEventHandler(AddressBookRepository addressBookRepository) {
		this.addressBookRepository = addressBookRepository;
	}

	@EventListener
	public void handleUserCreated(UserCreatedEvent event) {
		User user = event.getUser();

		AddressBook addressBook = new AddressBook();
		addressBook.setInternalUser(user);
		addressBook.setType(UserType.INTERNAL);
		addressBookRepository.save(addressBook);
	}

}
