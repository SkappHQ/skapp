package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.BusinessUnit;
import com.skapp.community.common.payload.request.BusinessUnitRequestDto;
import com.skapp.community.common.payload.response.BusinessUnitResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.BusinessUnitDao;
import com.skapp.community.common.service.BusinessUnitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class BusinessUnitServiceImpl implements BusinessUnitService {

	private final BusinessUnitDao businessUnitDao;

	@Override
	@Transactional
	public ResponseEntityDto createBusinessUnit(BusinessUnitRequestDto businessUnitRequestDto) {
		log.info("createBusinessUnit: execution started");

		validateBusinessUnitRequest(businessUnitRequestDto);

		String name = businessUnitRequestDto.getName();

		if (existsByNameCaseSensitive(name)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_ALREADY_EXISTS);
		}

		BusinessUnit businessUnit = new BusinessUnit();
		businessUnit.setName(name);
		businessUnit.setDescription(businessUnitRequestDto.getDescription());
		businessUnit = businessUnitDao.save(businessUnit);

		log.info("createBusinessUnit: execution ended");

		return new ResponseEntityDto(false, mapToResponseDto(businessUnit));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateBusinessUnit(Long id, BusinessUnitRequestDto businessUnitRequestDto) {
		log.info("updateBusinessUnit: execution started");

		BusinessUnit businessUnit = businessUnitDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NOT_FOUND));

		validateBusinessUnitRequest(businessUnitRequestDto);

		String name = businessUnitRequestDto.getName();

		if (!name.equals(businessUnit.getName()) && existsByNameCaseSensitiveExcludingId(name, id)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_ALREADY_EXISTS);
		}

		businessUnit.setName(name);
		businessUnit.setDescription(businessUnitRequestDto.getDescription());
		businessUnit = businessUnitDao.save(businessUnit);

		log.info("updateBusinessUnit: execution ended");

		return new ResponseEntityDto(false, mapToResponseDto(businessUnit));
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteBusinessUnit(Long id) {
		log.info("deleteBusinessUnit: execution started");

		BusinessUnit businessUnit = businessUnitDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NOT_FOUND));

		BusinessUnitResponseDto responseDto = mapToResponseDto(businessUnit);
		businessUnitDao.delete(businessUnit);

		log.info("deleteBusinessUnit: execution ended");

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getAllBusinessUnits() {
		log.info("getAllBusinessUnits: execution started");

		List<BusinessUnitResponseDto> businessUnits = businessUnitDao.findAllByOrderByNameAsc()
			.stream()
			.map(this::mapToResponseDto)
			.toList();

		log.info("getAllBusinessUnits: execution ended");

		return new ResponseEntityDto(false, businessUnits);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getBusinessUnitById(Long id) {
		log.info("getBusinessUnitById: execution started");

		BusinessUnit businessUnit = businessUnitDao.findById(id)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NOT_FOUND));

		log.info("getBusinessUnitById: execution ended");

		return new ResponseEntityDto(false, mapToResponseDto(businessUnit));
	}

	private boolean existsByNameCaseSensitive(String name) {
		return businessUnitDao.findByNameIgnoreCase(name).stream().anyMatch(bu -> bu.getName().equals(name));
	}

	private boolean existsByNameCaseSensitiveExcludingId(String name, Long excludeId) {
		return businessUnitDao.findByNameIgnoreCaseAndBusinessUnitIdNot(name, excludeId)
			.stream()
			.anyMatch(bu -> bu.getName().equals(name));
	}

	private void validateBusinessUnitRequest(BusinessUnitRequestDto businessUnitRequestDto) {
		String name = businessUnitRequestDto.getName();

		if (name == null || name.isBlank()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_REQUIRED);
		}

		if (name.length() > CommonConstants.BUSINESS_UNIT_NAME_MAX_LENGTH) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_NAME_LENGTH_EXCEEDED);
		}

		String description = businessUnitRequestDto.getDescription();

		if (description != null && description.length() > CommonConstants.BUSINESS_UNIT_DESCRIPTION_MAX_LENGTH) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_BUSINESS_UNIT_DESCRIPTION_LENGTH_EXCEEDED);
		}
	}

	private BusinessUnitResponseDto mapToResponseDto(BusinessUnit businessUnit) {
		BusinessUnitResponseDto dto = new BusinessUnitResponseDto();
		dto.setBusinessUnitId(businessUnit.getBusinessUnitId());
		dto.setName(businessUnit.getName());
		dto.setDescription(businessUnit.getDescription());
		return dto;
	}

}
