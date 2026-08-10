package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapperV2;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmDealResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmDealService;
import com.skapp.community.crmplanner.service.v2.CrmDealServiceV2;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmDealServiceImplV2 implements CrmDealServiceV2 {

	private final CrmDealService crmDealService;

	private final CrmDealDao crmDealDao;

	private final CrmMapperV2 crmMapperV2;

	private final UserService userService;

	private final PageTransformer pageTransformer;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDeals(CrmDealFilterDto filterDto) {
		log.info("getDeals: execution started");

		User currentUser = userService.getCurrentUser();
		Long ownerId = CrmUtil.isCrmSalesRepresentative(currentUser) ? currentUser.getEmployee().getEmployeeId() : null;

		Page<CrmDeal> dealsPage = crmDealDao.findDeals(filterDto, ownerId,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		List<CrmDealResponseDtoV2> deals = dealsPage.getContent()
			.stream()
			.map(crmMapperV2::crmDealToCrmDealResponseDtoV2)
			.toList();

		PageDto pageDto = pageTransformer.transform(dealsPage);
		pageDto.setItems(deals);

		log.info("getDeals: execution ended with {} result(s)", deals.size());
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getDealById(Long id) {
		log.info("getDealById: execution started");

		CrmDeal deal = crmDealDao.findByIdWithAssociations(id);
		if (deal == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
		}

		log.info("getDealById: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmDealToCrmDealResponseDtoV2(deal));
	}

	@Override
	@Transactional
	public ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto) {
		log.info("createDeal: execution started");

		CrmDeal savedDeal = crmDealService.persistNewDeal(requestDto);

		log.info("createDeal: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmDealToCrmDealResponseDtoV2(savedDeal));
	}

	@Override
	@Transactional
	public ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto) {
		log.info("editDeal: execution started");

		CrmDeal savedDeal = crmDealService.applyDealEdit(id, requestDto);

		log.info("editDeal: execution ended");
		return new ResponseEntityDto(false, crmMapperV2.crmDealToCrmDealResponseDtoV2(savedDeal));
	}

}
