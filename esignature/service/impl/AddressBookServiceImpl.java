package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.AddressBookFilterDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.payload.request.MySignatureLinkDto;
import com.skapp.enterprise.esignature.payload.response.AddressBookResponseDto;
import com.skapp.enterprise.esignature.payload.response.MySignatureLinkResponseDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.projection.AddressBookUserData;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.service.UserKeyService;
import com.skapp.enterprise.esignature.type.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressBookServiceImpl implements AddressBookService {

	private final ExternalUserService externalUserService;

	private final UserKeyService userKeyService;

	private final AddressBookDao addressBookDao;

	private final EsignMapper esignMapper;

	private final UserService userService;

	@Override
	public ResponseEntityDto addExternalUserToAddressBook(ExternalUserDto externalUserDto, UserType type) {
		validateRequest(externalUserDto);
		ExternalUser externalUser = externalUserService.createExternalUser(externalUserDto);
		AddressBook addressBook = new AddressBook();
		addressBook.setExternalUser(externalUser);
		addressBook.setType(type);
		addressBook = addressBookDao.save(addressBook);
		userKeyService.generateAndStoreKeys(addressBook);
		AddressBookResponseDto addressBookResponseDto = esignMapper.addressBookToAddressBookResponseDto(addressBook);
		return new ResponseEntityDto(false, addressBookResponseDto);
	}

	@Override
	public ResponseEntityDto getAddressBookContacts(AddressBookFilterDto addressBookFilterDto) {
		PageDto addressBookList = addressBookDao.fetchAddressBookWithPaginationAndSorting(addressBookFilterDto);
		return new ResponseEntityDto(false, addressBookList);
	}

	@Override
	public ResponseEntityDto fetchAddressBookContactsByEmailPriority(String keyWord) {
		List<AddressBookUserData> addressBookUserDataList = addressBookDao
			.fetchAddressBookContactsByEmailPriority(keyWord);
		return new ResponseEntityDto(false, addressBookUserDataList);
	}

	@Override
	public ResponseEntityDto fetchAddressBookInternalEsignSenderByEmailPriority(String keyWord) {
		List<AddressBookUserData> addressBookUserDataList = addressBookDao
			.fetchAddressBookEsignSenderByEmailPriority(keyWord);
		return new ResponseEntityDto(false, addressBookUserDataList);
	}

	private void validateRequest(ExternalUserDto externalUserDto) {
		Validations.validateEmail(externalUserDto.getEmail());
		Validations.validateName(externalUserDto.getFirstName());

		if (externalUserDto.getLastName() != null && !externalUserDto.getLastName().isEmpty()) {
			Validations.validateName(externalUserDto.getLastName());
		}

		if (externalUserDto.getPhone() != null && !externalUserDto.getPhone().isEmpty()) {
			Validations.validateContactNo(externalUserDto.getPhone());
		}
	}

	@Override
	public ResponseEntityDto addUpdateMySignatureLink(MySignatureLinkDto mySignatureLinkDto) {
		User currentUser = userService.getCurrentUser();

		AddressBook addressBook = addressBookDao.findByInternalUser(currentUser).orElseThrow(() -> {
			log.error("AddressBook not found for internal user id: {}", currentUser.getUserId());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND);
		});

		if (mySignatureLinkDto.getMySignatureLink() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_MY_SIGNATURE_LINK_EMPTY);
		}
		addressBook.setMySignatureLink(mySignatureLinkDto.getMySignatureLink());
		addressBookDao.save(addressBook);

		MySignatureLinkResponseDto mySignatureLinkResponseDto = esignMapper
			.addressBookToMySignatureLinkResponseDto(addressBook);
		mySignatureLinkResponseDto.setInternalExternalUserId(addressBook.getUserId());

		return new ResponseEntityDto(false, mySignatureLinkResponseDto);
	}

	@Override
	public ResponseEntityDto getMySignatureLink() {
		User currentUser = userService.getCurrentUser();

		AddressBook addressBook = addressBookDao.findByInternalUser(currentUser).orElseThrow(() -> {
			log.error("AddressBook not found for internal user id: {}", currentUser.getUserId());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND);
		});

		MySignatureLinkResponseDto mySignatureLinkResponseDto = esignMapper
			.addressBookToMySignatureLinkResponseDto(addressBook);
		mySignatureLinkResponseDto.setInternalExternalUserId(addressBook.getUserId());

		return new ResponseEntityDto(false, mySignatureLinkResponseDto);
	}

}
