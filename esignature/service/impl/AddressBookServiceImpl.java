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
import com.skapp.enterprise.esignature.repository.projection.AddressBookSenderData;
import com.skapp.enterprise.esignature.repository.projection.AddressBookUserData;
import com.skapp.enterprise.esignature.service.AddressBookService;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.service.UserKeyService;
import com.skapp.enterprise.esignature.type.UserType;
import com.skapp.enterprise.esignature.util.EsignUtil;
import com.skapp.enterprise.esignature.util.EsignValidations;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressBookServiceImpl implements AddressBookService {

	public static final String HTTPS_PROTOCOL = "https://";

	private final ExternalUserService externalUserService;

	private final UserKeyService userKeyService;

	private final AddressBookDao addressBookDao;

	private final EsignMapper esignMapper;

	private final UserService userService;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

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
		List<AddressBookSenderData> addressBookUserDataList = addressBookDao
			.fetchAddressBookEsignSenderByEmailPriority(keyWord);
		return new ResponseEntityDto(false, addressBookUserDataList);
	}

	private void validateRequest(ExternalUserDto externalUserDto) {

		externalUserDto.setEmail(externalUserDto.getEmail().trim());
		Validations.validateEmail(externalUserDto.getEmail());
		externalUserDto.setFirstName(externalUserDto.getFirstName().trim());
		EsignValidations.validateExternalUserName(externalUserDto.getFirstName());

		if (externalUserDto.getLastName() != null && !externalUserDto.getLastName().isEmpty()) {
			externalUserDto.setLastName(externalUserDto.getLastName().trim());
			EsignValidations.validateExternalUserName(externalUserDto.getLastName());
		}

		if (externalUserDto.getPhone() != null && !externalUserDto.getPhone().isEmpty()) {
			Validations.validateContactNo(externalUserDto.getPhone());
		}
	}

	@Override
	public ResponseEntityDto addUpdateMySignatureLink(MySignatureLinkDto mySignatureLinkDto) {
		User currentUser = userService.getCurrentUser();

		AddressBook addressBook = addressBookDao.findByInternalUser(currentUser).orElseThrow(() -> {
			log.error("addUpdateMySignatureLink: AddressBook not found for internal user id: {}",
					currentUser.getUserId());
			return new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND);
		});

		if (mySignatureLinkDto.getMySignatureLink() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_MY_SIGNATURE_LINK_EMPTY);
		}

		if (mySignatureLinkDto.getMySignatureMethod() == null) {
			throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_MY_SIGNATURE_METHOD_EMPTY);
		}

		if (mySignatureLinkDto.getFontColor() != null) {
			addressBook.setFontColor(mySignatureLinkDto.getFontColor());
		}

		if (mySignatureLinkDto.getFontFamily() != null) {
			addressBook.setFontFamily(mySignatureLinkDto.getFontFamily());
		}

		addressBook.setMySignatureMethod(mySignatureLinkDto.getMySignatureMethod());
		addressBook.setMySignatureLink(mySignatureLinkDto.getMySignatureLink());
		addressBookDao.save(addressBook);

		MySignatureLinkResponseDto mySignatureLinkResponseDto = esignMapper
			.addressBookToMySignatureLinkResponseDto(addressBook);
		mySignatureLinkResponseDto.setMySignatureLink(addressBook.getMySignatureLink());
		mySignatureLinkResponseDto.setUserId(addressBook.getUserId());

		return new ResponseEntityDto(false, mySignatureLinkResponseDto);
	}

	@Override
	public ResponseEntityDto getMySignatureLink() {
		User currentUser = userService.getCurrentUser();

		AddressBook addressBook = addressBookDao.findByInternalUser(currentUser).orElseThrow(() -> {
			log.error("AddressBook not found for internal user id: {}", currentUser.getUserId());
			return new ModuleException(EsignMessageConstant.ESIGN_ERROR_ADDRESS_BOOK_ID_NOT_FOUND);
		});

		MySignatureLinkResponseDto mySignatureLinkResponseDto = esignMapper
			.addressBookToMySignatureLinkResponseDto(addressBook);
		mySignatureLinkResponseDto.setUserId(addressBook.getUserId());
		mySignatureLinkResponseDto.setFirstName(addressBook.getFirstName());
		mySignatureLinkResponseDto.setLastName(addressBook.getLastName());

		if (addressBook.getMySignatureLink() != null) {
			mySignatureLinkResponseDto.setMySignatureLink(HTTPS_PROTOCOL + cloudFrontDomain + "/"
					+ EsignUtil.removeEsignPrefix(addressBook.getMySignatureLink()));
		}

		return new ResponseEntityDto(false, mySignatureLinkResponseDto);
	}

	@Override
	public ResponseEntityDto addCustomerToAddressBook(Customer customer, UserType type) {
		AddressBook addressBook = initializeAddressBook(customer, null, type);
		AddressBookResponseDto addressBookResponseDto = esignMapper.addressBookToAddressBookResponseDto(addressBook);
		return new ResponseEntityDto(false, addressBookResponseDto);
	}

	@Override
	public ResponseEntityDto addCustomerContactToAddressBook(CustomerContact customerContact, UserType type) {

		AddressBook addressBook = initializeAddressBook(null, customerContact, type);
		AddressBookResponseDto addressBookResponseDto = esignMapper.addressBookToAddressBookResponseDto(addressBook);
		return new ResponseEntityDto(false, addressBookResponseDto);
	}

	private AddressBook initializeAddressBook(Customer customer, CustomerContact customerContact, UserType type) {

		AddressBook addressBook = new AddressBook();

		if (customer != null) {
			addressBook.setCustomer(customer);

		}

		if (customerContact != null) {
			addressBook.setCustomerContact(customerContact);
		}

		addressBook.setType(type);
		addressBook = addressBookDao.save(addressBook);
		userKeyService.generateAndStoreKeys(addressBook);

		return addressBook;
	}

}
