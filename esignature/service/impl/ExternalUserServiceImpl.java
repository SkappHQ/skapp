package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
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
		Optional<ExternalUser> existingUser = externalUserRepository.findByEmail(externalUserDto.getEmail());
		Optional<User> internalUser = userDao.findByEmail(externalUserDto.getEmail());

		if (existingUser.isPresent() || internalUser.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_EXITS);
		}

		ExternalUser externalUser = esignMapper.externalUserDtoToExternalUser(externalUserDto);

		return externalUserRepository.save(externalUser);
	}

	@Override
	public ResponseEntityDto editExternalUser(Long id, ExternalPatchUserDto externalUserDto) {
		log.info("editExternalUser: execution started");
		Optional<ExternalUser> optionalExternalUser = externalUserDao.findById(id);
		if (optionalExternalUser.isEmpty()) {
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_NOT_FOUND);
		}

		ExternalUser externalUser = optionalExternalUser.get();
		Optional<AddressBook> optionalAddressBook = addressBookDao.findByExternalUser(externalUser);

		if (optionalAddressBook.isEmpty()) {
			log.warn("deleteExternalUser: AddressBook with external user ID {} not found", id);
			throw new EntityNotFoundException(
					EsignMessageConstant.ESIGN_ERROR_MISSING_EXTERNAL_USER_ID_IN_ADDRESS_BOOK);
		}

		AddressBook addressBook = optionalAddressBook.get();
		if (Boolean.FALSE.equals(addressBook.getIsActive())) {
			log.warn("deleteExternalUser: User ID {} is already marked as DELETED", id);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_ALREADY_DELETED);
		}

		Optional<ExternalUser> existingUser = externalUserRepository.findByEmail(externalUserDto.getEmail());
		Optional<User> internalUser = userDao.findByEmail(externalUserDto.getEmail());

		if (existingUser.isPresent() || internalUser.isPresent()) {
			log.warn("editExternalUser: Email {} already exists for another user", externalUserDto.getEmail());
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_EMAIL_ALREADY_EXITS);
		}

		if (externalUserDto.getFirstName() != null) {
			externalUser.setFirstName(externalUserDto.getFirstName());
		}
		if (externalUserDto.getLastName() != null) {
			externalUser.setLastName(externalUserDto.getLastName());
		}
		if (externalUserDto.getEmail() != null) {
			externalUser.setEmail(externalUserDto.getEmail());
		}
		if (externalUserDto.getPhone() != null) {
			externalUser.setPhone(externalUserDto.getPhone());
		}

		externalUserRepository.save(externalUser);
		log.info("editExternalUser: execution ended");
		return new ResponseEntityDto(false, externalUserDto);
	}

	@Override
	public ResponseEntityDto deleteExternalUser(Long id) {
		log.info("deleteExternalUser: execution started for user ID: {}", id);
		Optional<ExternalUser> optionalUser = externalUserRepository.findById(id);
		if (optionalUser.isEmpty()) {
			log.warn("deleteExternalUser: User with ID {} not found", id);
			throw new EntityNotFoundException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_NOT_FOUND);
		}

		ExternalUser externalUser = optionalUser.get();
		Optional<AddressBook> optionalAddressBook = addressBookDao.findByExternalUser(externalUser);
		if (optionalAddressBook.isEmpty()) {
			log.warn("deleteExternalUser: AddressBook with external user ID {} not found", id);
			throw new EntityNotFoundException(
					EsignMessageConstant.ESIGN_ERROR_MISSING_EXTERNAL_USER_ID_IN_ADDRESS_BOOK);
		}
		AddressBook addressBook = optionalAddressBook.get();

		if (Boolean.FALSE.equals(addressBook.getIsActive())) {
			log.warn("deleteExternalUser: User ID {} is already marked as DELETED", id);
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_ALREADY_DELETED);
		}

		addressBook.setIsActive(false);
		externalUser.setEmail(PeopleConstants.DELETED_PREFIX + externalUser.getEmail());
		log.info("deleteExternalUser: User ID {} email updated to {}", id, externalUser.getEmail());
		addressBookDao.save(addressBook);
		externalUserRepository.save(externalUser);
		log.info("deleteExternalUser: execution ended successfully for user ID: {}", id);

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
