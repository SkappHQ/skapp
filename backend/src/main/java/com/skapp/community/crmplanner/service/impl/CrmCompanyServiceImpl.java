package com.skapp.community.crmplanner.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyNameExistsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.CrmCompanyService;
import com.skapp.community.crmplanner.util.CrmValidations;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImpl implements CrmCompanyService {

	private final CrmCompanyDao crmCompanyDao;

	private final CrmMapper crmCompanyMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompanies(CrmCompanyFilterDto filterDto) {
		log.info("getCompanies: execution started");

		Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize());
		Page<CrmCompany> companyPage = crmCompanyDao.findCompanies(filterDto, pageable);

		List<CrmCompanyLookupResponseDto> companyResponseDtos = companyPage.getContent()
			.stream()
			.map(crmCompanyMapper::crmCompanyToCrmCompanyLookupResponseDto)
			.toList();

		PageDto pageDto = new PageDto();
		pageDto.setItems(companyResponseDtos);
		pageDto.setCurrentPage(companyPage.getNumber());
		pageDto.setTotalItems(companyPage.getTotalElements());
		pageDto.setTotalPages(companyPage.getTotalPages());

		log.info("getCompanies: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

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

	@Override
	public ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable) {
		log.info("getCompanyMetrics: execution started");
		Page<CrmCompanyMetricsResponseDto> page = crmCompanyDao.getCompanyMetrics(pageable, searchKeyword);

		PageDto response = new PageDto();
		response.setItems(page.getContent());
		response.setCurrentPage(page.getNumber());
		response.setTotalItems(page.getTotalElements());
		response.setTotalPages(page.getTotalPages());
		log.info("getCompanyMetrics: execution ended");

		return new ResponseEntityDto(false, response);
	}

}
