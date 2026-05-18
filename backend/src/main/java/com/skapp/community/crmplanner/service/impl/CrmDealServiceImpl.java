package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmDealMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmPriority;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmPriorityDao;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImpl implements CrmDealService {

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmPriorityDao crmPriorityDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final EmployeeDao employeeDao;

	private final CrmDealMapper crmDealMapper;

	private final PageTransformer pageTransformer;

	@Override
	@Transactional
	public ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto) {
		log.info("createDeal: creating deal with name={}", requestDto.getName());

		CrmDealStage stage = crmDealStageDao.findByIdAndIsDeletedFalse(requestDto.getStageId())
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND));

		CrmPriority priority = null;
		if (requestDto.getPriorityId() != null) {
			priority = crmPriorityDao.findById(requestDto.getPriorityId())
				.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_PRIORITY_NOT_FOUND));
		}

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

		Employee owner = employeeDao.findEmployeeByEmployeeIdAndUserIsActiveTrue(requestDto.getOwnerId());
		if (owner == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_NOT_FOUND);
		}

		EmployeeRole ownerRole = owner.getEmployeeRole();
		if (ownerRole == null || ownerRole.getCrmRole() == null || ownerRole.getCrmRole() == Role.CRM_NONE) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_INVALID_ROLE);
		}

		CrmDeal deal = new CrmDeal();
		deal.setName(requestDto.getName());
		deal.setStage(stage);
		deal.setPriority(priority);
		deal.setClosingAt(requestDto.getClosingAt());
		deal.setAmount(requestDto.getAmount());
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(owner);

		CrmDeal savedDeal = crmDealDao.save(deal);
		CrmDealResponseDto responseDto = crmDealMapper.crmDealToCrmDealResponseDto(savedDeal);

		log.info("createDeal: deal created with id={}", savedDeal.getId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		Sort sort = Sort.by(filterDto.getSortOrder(), filterDto.getSortKey().getDbField());
		Page<CrmDeal> dealsPage = crmDealDao.findAllDeals(filterDto,
				PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort));

		List<CrmDealResponseDto> deals = crmDealMapper.crmDealsToCrmDealResponseDtos(dealsPage.getContent());

		PageDto pageDto = pageTransformer.transform(dealsPage);
		pageDto.setItems(deals);

		log.info("getDeals: execution ended with {} result(s)", deals.size());
		return new ResponseEntityDto(false, pageDto);
	}

}
