package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.payload.request.MySignatureLinkDto;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.model.CustomerContact_;

public interface AddressBookService {

	/**
	 * Adds an ExternalUser to the address book.
	 * @param externalUser The external user to be added.
	 * @param type The type of the user (e.g., EXTERNAL).
	 * @return The AddressBook entry.
	 */
	ResponseEntityDto addExternalUserToAddressBook(ExternalUserDto externalUser, UserType type);

	ResponseEntityDto getAddressBookContacts(AddressBookFilterDto addressBookFilterDto);

	ResponseEntityDto fetchAddressBookContactsByEmailPriority(String keyWord);

	ResponseEntityDto fetchAddressBookInternalEsignSenderByEmailPriority(String keyWord);

	ResponseEntityDto addUpdateMySignatureLink(MySignatureLinkDto mySignatureLinkDto);

	ResponseEntityDto getMySignatureLink();

	ResponseEntityDto addCustomerToAddressBook(Customer customer, UserType type);

	ResponseEntityDto addCustomerContactToAddressBook(CustomerContact customerContact, UserType type);

}
