package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImpl implements CrmDealService {

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final EmployeeDao employeeDao;

	private final CrmMapper crmMapper;

	private final PageTransformer pageTransformer;

	@Override
	@Transactional
	public ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto) {
		log.info("createDeal: creating deal with name={}", requestDto.getName());

		if (requestDto.getName() == null || requestDto.getName().isBlank()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NAME_REQUIRED);
		}

		if (requestDto.getName().length() > CrmConstants.DEAL_NAME_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NAME_TOO_LONG);
		}

		if (requestDto.getName().chars().anyMatch(Character::isISOControl)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NAME_INVALID_CHARS);
		}

		if (requestDto.getPriority() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_PRIORITY_NOT_FOUND);
		}
		
		if (!Arrays.asList(CrmDealPriority.values()).contains(requestDto.getPriority())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_PRIORITY_NOT_FOUND);
		}

		if (requestDto.getStageId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_ID_REQUIRED);
		}

		if (requestDto.getContactId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_NOT_FOUND);
		}

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		CrmContact contact = crmContactDao.findByIdAndIsDeletedFalse(requestDto.getContactId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_NOT_FOUND));

		CrmCompany company = null;
		if (requestDto.getCompanyId() != null) {
			if (contact.getCompany() == null || !contact.getCompany().getId().equals(requestDto.getCompanyId())) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_CONTACT_COMPANY_MISMATCH);
			}
			company = crmCompanyDao.findByIdAndIsDeletedFalse(requestDto.getCompanyId())
					.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_COMPANY_NOT_FOUND));
		}

		if (requestDto.getOwnerId() == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_NOT_FOUND);
		}

		Employee owner = employeeDao.findEmployeeByEmployeeIdAndUserIsActiveTrue(requestDto.getOwnerId());
		if (owner == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_NOT_FOUND);
		}

		if (owner.getEmployeeRole() == null || owner.getEmployeeRole().getCrmRole() == null
				|| !CrmConstants.ASSIGNABLE_CRM_ROLES.contains(owner.getEmployeeRole().getCrmRole())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_INVALID_ROLE);
		}

		CrmDeal deal = new CrmDeal();
		deal.setName(requestDto.getName());
		deal.setDescription(requestDto.getDescription());
		deal.setStage(stage);
		deal.setPriority(requestDto.getPriority());
		deal.setClosingAt(requestDto.getClosingAt());
		deal.setAmount(requestDto.getAmount());
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(owner);

		CrmDeal savedDeal = crmDealDao.save(deal);
		CrmDealResponseDto responseDto = crmMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("createDeal: deal created with id={}", savedDeal.getId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		Sort sort = Sort.by(filterDto.getSortOrder(), filterDto.getSortKey().getDbField());
		Page<CrmDeal> dealsPage = crmDealDao.findDeals(filterDto,
				PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort));

		List<CrmDealResponseDto> deals = crmMapper.crmDealsToCrmDealResponseDtos(dealsPage.getContent());

		PageDto pageDto = pageTransformer.transform(dealsPage);
		pageDto.setItems(deals);

		log.info("getDeals: execution ended with {} result(s)", deals.size());
		return new ResponseEntityDto(false, pageDto);
	}

}
