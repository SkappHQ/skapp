package com.skapp.community.crmplanner.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyEditDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyDomainSearchResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyLookupResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyNameExistsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
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

	private final CrmDealDao crmDealDao;

	private final CrmMapper crmCompanyMapper;

	private final MessageUtil messageUtil;

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

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto searchCompaniesByDomain(String domain) {
		log.info("searchCompaniesByDomain: execution started");

		List<CrmCompany> companies = crmCompanyDao.findCompaniesByWebsiteDomain(domain);

		CrmCompanyDomainSearchResponseDto responseDto = new CrmCompanyDomainSearchResponseDto();
		responseDto.setCompanies(companies);

		log.info("searchCompaniesByDomain: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteCompany(Long id) {
		log.info("deleteCompany: execution started");

		CrmValidations.validateCompanyId(id);

		CrmCompany company = crmCompanyDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));

		List<CrmDeal> deals = crmDealDao.findAllByCompanyIdAndIsDeletedFalse(id);
		deals.forEach(deal -> deal.setIsDeleted(true));
		crmDealDao.saveAll(deals);

		company.setIsDeleted(true);
		crmCompanyDao.save(company);

		log.info("deleteCompany: execution ended successfully");
		return new ResponseEntityDto(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_COMPANY_DELETED), false);
	}

	@Override
	@Transactional
	public ResponseEntityDto editCompany(Long id, CrmCompanyEditDto crmCompany) {
		log.info("editCompany: execution started");

		CrmValidations.validateCompanyId(id);

		CrmCompany existingCompany = crmCompanyDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND));

		if (crmCompany.getName() != null) {
			CrmValidations.validateCompanyName(crmCompany.getName());
			if (!existingCompany.getName().equalsIgnoreCase(crmCompany.getName())
					&& checkCompanyExists(crmCompany.getName())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS);
			}
			existingCompany.setName(crmCompany.getName());
		}

		if (crmCompany.getContactNumber() != null) {
			CrmValidations.validateContactNumber(crmCompany.getContactNumber());
			existingCompany.setContactNumber(crmCompany.getContactNumber());
		}

		if (crmCompany.getWebsite() != null) {
			CrmValidations.validateWebsite(crmCompany.getWebsite());
			existingCompany.setWebsite(crmCompany.getWebsite());
		}

		if (crmCompany.getAddress() != null) {
			CrmValidations.validateAddress(crmCompany.getAddress());
			existingCompany.setAddress(crmCompany.getAddress());
		}

		if (crmCompany.getIndustry() != null) {
			existingCompany.setIndustry(crmCompany.getIndustry());
		}

		CrmCompany updatedCompany = crmCompanyDao.save(existingCompany);
		CrmCompanyResponseDto responseDto = crmCompanyMapper.crmCompanyToCrmCompanyResponseDto(updatedCompany);

		log.info("editCompany: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

}
