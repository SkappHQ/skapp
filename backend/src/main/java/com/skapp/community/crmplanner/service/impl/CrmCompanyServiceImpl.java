package com.skapp.community.crmplanner.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyNameExistsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.CrmCompanyService;
import com.skapp.community.crmplanner.util.CrmValidations;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImpl implements CrmCompanyService {

	private final CrmCompanyDao crmCompanyDao;

	private final CrmMapper crmCompanyMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto checkCompanyNameExists(String name) {
		log.info("checkCompanyNameExists: execution started");
		CrmValidations.validateCompanyName(name);
		boolean exists = checkCompanyExists(name);

		CrmCompanyNameExistsResponseDto responseDto = new CrmCompanyNameExistsResponseDto();
		responseDto.setIsExists(exists);

		log.info("checkCompanyNameExists: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany) {
		log.info("createCompany: execution started");

		CrmValidations.validateCompanyName(crmCompany.getName());
		CrmValidations.validateContactNumber(crmCompany.getContactNumber());
		CrmValidations.validateWebsite(crmCompany.getWebsite());
		CrmValidations.validateAddress(crmCompany.getAddress());
		CrmValidations.validateIndustry(crmCompany.getIndustry());

		if (checkCompanyExists(crmCompany.getName())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS);
		}

		CrmCompany newCompany = crmCompanyMapper.crmCompanyCreateDtoToCrmCompany(crmCompany);
		CrmCompany result = crmCompanyDao.save(newCompany);
		CrmCompanyResponseDto responseDto = crmCompanyMapper.crmCompanyToCrmCompanyResponseDto(result);

		log.info("createCompany: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

	private boolean checkCompanyExists(String name) {
		return crmCompanyDao.existsByNameIgnoreCaseAndIsDeletedFalse(name);
	}

}
