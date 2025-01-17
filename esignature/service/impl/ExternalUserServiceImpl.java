package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
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

	private final EsignMapper esignMapper;

	@Override
	public ExternalUser createExternalUser(ExternalUserDto externalUserDto) {
		Optional<ExternalUser> existingUser = externalUserRepository.findByEmail(externalUserDto.getEmail());

		if (existingUser.isPresent()) {
			throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_EXTERNAL_USER_EXITS);
		}

		ExternalUser externalUser = esignMapper.externalUserDtoToExternalUser(externalUserDto);

		return externalUserRepository.save(externalUser);
	}

}
