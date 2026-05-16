package com.skapp.community.crmplanner.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyTableViewDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;
import com.skapp.community.crmplanner.service.CrmCompanyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImpl implements CrmCompanyService {

	private final CrmCompanyDao crmCompanyDao;

	private final CrmCompanyRepository crmCompanyRepository;

	private final CrmMapper crmMapper;

	@Override
	public ResponseEntityDto checkCompanyNameExists(String name) {
		log.info("checkCompanyNameExists: execution started for name: {}", name);
		boolean exists = checkCompanyExists(name);
		log.info("checkCompanyNameExists: execution ended, exists: {}", exists);

		return new ResponseEntityDto(false, exists);
	}

	@Override
	@Transactional
	public ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany) throws ValidationException {
		if (checkCompanyExists(crmCompany.getName())) {
			throw new ValidationException(CrmMessageConstant.COMMON_ERROR_COMPANY_EXISTS);
		}
		log.info("createCompany: execution started");
		CrmCompany newCompany = crmMapper.crmCompanyCreateDtoToCrmCompany(crmCompany);
		CrmCompany result = crmCompanyDao.save(newCompany);
		CrmCompanyResponseDto responseDto = crmMapper.crmCompanyToCrmCompanyResponseDto(result);
		log.info("createCompany: execution ended successfully");

		return new ResponseEntityDto(false, responseDto);
	}

	private boolean checkCompanyExists(String name) {
		return crmCompanyDao.existsByNameIgnoreCaseAndIsDeletedFalse(name.trim());
	}

	@Override
	public PageDto getCompanyTableView(String searchKeyword, Pageable pageable) {
		log.info("getAllCompanies: execution started");
		Page<CrmCompanyTableViewDto> page = crmCompanyRepository.getCompanyTableViewDetails(pageable, searchKeyword);

		PageDto response = new PageDto();
		response.setItems(page.getContent());
		response.setCurrentPage(page.getNumber());
		response.setTotalItems(page.getTotalElements());
		response.setTotalPages(page.getTotalPages());
		log.info("getAllCompanies: execution ended");

		return response;
	}

}
