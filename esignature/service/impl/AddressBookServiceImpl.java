package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookRepository;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.type.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AddressBookServiceImpl implements AddressBookService {

	private final ExternalUserService externalUserService;

	private final AddressBookRepository addressBookRepository;

	private final EsignMapper esignMapper;

	@Override
	public ResponseEntityDto addExternalUserToAddressBook(ExternalUserDto externalUserDto, UserType type) {
		ExternalUser externalUser = externalUserService.createExternalUser(externalUserDto);
		AddressBook addressBook = new AddressBook();
		addressBook.setExternalUser(externalUser);
		addressBook.setType(type);
		addressBook = addressBookRepository.save(addressBook);
		AddressBookResponseDto addressBookResponseDto = esignMapper.addressBookToAddressBookResponseDto(addressBook);
		return new ResponseEntityDto(false, addressBookResponseDto);
	}

}
