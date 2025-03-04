package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.UserKey;
import jakarta.validation.constraints.NotNull;

public interface UserKeyService {

	void generateAndStoreKeys(AddressBook addressBook);

	UserKey getKeyPairByAddressBookId(@NotNull Long addressBookId);

}
