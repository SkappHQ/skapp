package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.AddressBook;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.ExternalPatchUserDto;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.repository.AddressBookDao;
import com.skapp.enterprise.esignature.repository.ExternalUserDao;
import com.skapp.enterprise.esignature.repository.ExternalUserRepository;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import com.skapp.enterprise.esignature.util.EsignValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExternalUserServiceImpl implements ExternalUserService {

	private final ExternalUserRepository externalUserRepository;

	private final ExternalUserDao externalUserDao;

	private final UserDao userDao;

	private final EsignMapper esignMapper;

	private final AddressBookDao addressBookDao;

	@Override
	public ExternalUser createExternalUser(ExternalUserDto externalUserDto) {

		Optional<AddressBook> byInternalUserEmail = addressBookDao.findByInternalUserEmail(externalUserDto.getEmail());

		if (byInternalUserEmail.isPresent() && Boolean.TRUE.equals(byInternalUserEmail.get().getIsActive())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ALREADY_EXISTS);
		}

		Optional<AddressBook> byExternalUserEmail = addressBookDao.findByExternalUserEmail(externalUserDto.getEmail());

		if (byExternalUserEmail.isPresent() && Boolean.TRUE.equals(byExternalUserEmail.get().getIsActive())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ALREADY_EXISTS);
		}

		ExternalUser externalUser = esignMapper.externalUserDtoToExternalUser(externalUserDto);

		return externalUserRepository.save(externalUser);
	}

	@Override
	public ResponseEntityDto editExternalUser(Long addressBookId, ExternalPatchUserDto externalUserDto) {
		log.info("editExternalUser: execution started");
		Optional<AddressBook> optionalAddressBook = addressBookDao.findById(addressBookId);

		if (optionalAddressBook.isEmpty()) {
			log.warn("editExternalUser: AddressBook with ID {} not found", addressBookId);
			throw new EntityNotFoundException(
					EsignMessageConstant.ESIGN_ERROR_MISSING_EXTERNAL_USER_ID_IN_ADDRESS_BOOK);
		}

		AddressBook addressBook = optionalAddressBook.get();
		if (Boolean.FALSE.equals(addressBook.getIsActive())) {
			log.warn("editExternalUser: AddressBook ID {} is already marked as DELETED", addressBookId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_ALREADY_DELETED);
		}

		ExternalUser externalUser = addressBook.getExternalUser();
		if (externalUser == null) {
			log.warn("editExternalUser: ExternalUser not found for AddressBook ID {}", addressBookId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_NOT_FOUND);
		}

		Optional<ExternalUser> existingUser = externalUserRepository.findByEmail(externalUserDto.getEmail());
		Optional<User> internalUser = userDao.findByEmail(externalUserDto.getEmail());

		if (existingUser.isPresent() || internalUser.isPresent()) {
			log.warn("editExternalUser: Email {} already exists for another user", externalUserDto.getEmail());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_EMAIL_ALREADY_EXITS);
		}

		if (externalUserDto.getFirstName() != null) {
			externalUserDto.setFirstName(externalUserDto.getFirstName().trim());
			EsignValidations.validateExternalUserName(externalUserDto.getFirstName());
			externalUser.setFirstName(externalUserDto.getFirstName());
		}
		if (externalUserDto.getLastName() != null) {
			externalUserDto.setFirstName(externalUserDto.getFirstName().trim());
			EsignValidations.validateExternalUserName(externalUserDto.getLastName());
			externalUser.setLastName(externalUserDto.getLastName());
		}
		if (externalUserDto.getEmail() != null) {
			Validations.validateEmail(externalUserDto.getEmail());
			externalUser.setEmail(externalUserDto.getEmail().trim());
		}
		if (externalUserDto.getPhone() != null) {
			Validations.validateContactNo(externalUserDto.getPhone());
			externalUser.setPhone(externalUserDto.getPhone());
		}

		externalUserRepository.save(externalUser);
		log.info("editExternalUser: execution ended");
		return new ResponseEntityDto(false, externalUserDto);
	}

	@Override
	public ResponseEntityDto deleteExternalUser(Long addressBookId) {
		log.info("deleteExternalUser: execution started for AddressBook ID: {}", addressBookId);
		Optional<AddressBook> optionalAddressBook = addressBookDao.findById(addressBookId);

		if (optionalAddressBook.isEmpty()) {
			log.warn("deleteExternalUser: AddressBook with ID {} not found", addressBookId);
			throw new EntityNotFoundException(
					EsignMessageConstant.ESIGN_ERROR_MISSING_EXTERNAL_USER_ID_IN_ADDRESS_BOOK);
		}

		AddressBook addressBook = optionalAddressBook.get();

		if (Boolean.FALSE.equals(addressBook.getIsActive())) {
			log.warn("deleteExternalUser: AddressBook ID {} is already marked as DELETED", addressBookId);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_ALREADY_DELETED);
		}

		ExternalUser externalUser = addressBook.getExternalUser();
		if (externalUser == null) {
			log.warn("deleteExternalUser: ExternalUser not found for AddressBook ID {}", addressBookId);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_NOT_FOUND);
		}

		addressBook.setIsActive(false);
		// Add timestamp to make the deleted email unique
		String timestamp = String.valueOf(System.currentTimeMillis());
		externalUser.setEmail(PeopleConstants.DELETED_PREFIX + timestamp + "_" + externalUser.getEmail());
		log.info("deleteExternalUser: ExternalUser email updated to {}", externalUser.getEmail());
		addressBookDao.save(addressBook);
		externalUserRepository.save(externalUser);
		log.info("deleteExternalUser: execution ended successfully for AddressBook ID: {}", addressBookId);

		return new ResponseEntityDto(false, "User deleted successfully");
	}

	@Override
	public ExternalUser loadUserByEmail(String email) {
		Optional<ExternalUser> optionalUser = externalUserDao.findByEmail(email);
		if (optionalUser.isEmpty()) {
			log.warn("loadUserByEmail: User with email {} not found", email);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_NOT_FOUND);
		}

		return optionalUser.get();
	}

}
