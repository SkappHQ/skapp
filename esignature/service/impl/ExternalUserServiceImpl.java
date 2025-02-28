package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.util.Validations;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.ExternalUser;
import com.skapp.enterprise.esignature.payload.request.ExternalUserDto;
import com.skapp.enterprise.esignature.repository.ExternalUserRepository;
import com.skapp.enterprise.esignature.service.ExternalUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExternalUserServiceImpl implements ExternalUserService {

	private final ExternalUserRepository externalUserRepository;

	private final UserDao userDao;

	private final EsignMapper esignMapper;

	@Override
	public ExternalUser createExternalUser(ExternalUserDto externalUserDto) {
		Optional<ExternalUser> existingUser = externalUserRepository.findByEmail(externalUserDto.getEmail());
		Optional<User> internalUser = userDao.findByEmail(externalUserDto.getEmail());

		if (existingUser.isPresent() || internalUser.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_EXITS);
		}

		if (externalUserDto.getPhone() != null && !externalUserDto.getPhone().isEmpty()) {
			boolean isValidPhoneNumber = Validations.isValidPhoneNumber(externalUserDto.getPhone());
			if (!isValidPhoneNumber) {
				throw new ModuleException(EsignMessageConstant.ESIGN_VALIDATION_PHONE_NUMBER_INVALID);
			}
		}

		ExternalUser externalUser = esignMapper.externalUserDtoToExternalUser(externalUserDto);

		return externalUserRepository.save(externalUser);
	}

}
