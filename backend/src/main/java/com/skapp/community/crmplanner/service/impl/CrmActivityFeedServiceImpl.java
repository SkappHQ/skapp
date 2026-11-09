package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityRecordFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityRecordRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.crmplanner.type.CrmActivityRecordType;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityFeedRepository crmActivityFeedRepository;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	private final PageTransformer pageTransformer;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		User currentUser = userService.getCurrentUser();
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		boolean hasDateRange = filterDto.getFromDate() != null || filterDto.getToDate() != null;
		if (isRepresentative && (filterDto.getOwnerId() != null || hasDateRange)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ACCESS_DENIED);
		}

		CrmValidations.validateActivityDateRange(filterDto.getFromDate(), filterDto.getToDate());

		CrmActivityListParams params = new CrmActivityListParams();
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);
		params.setOwnerId(filterDto.getOwnerId());
		params.setSortOrder(Sort.Direction.DESC);
		params.setSearchPattern(filterDto.getSearch() == null ? null : filterDto.getSearch().trim());
		ZoneId zone = timeZoneService.requestTimezone();
		if (filterDto.getFromDate() != null) {
			params.setRangeStart(filterDto.getFromDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getToDate() != null) {
			params.setRangeEnd(filterDto.getToDate().plusDays(1).atStartOfDay(zone).toInstant());
		}

		Page<CrmActivityFeedRowResponseDto> activityPage = crmActivityFeedRepository.findActivities(params,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		PageDto pageDto = new PageDto();
		pageDto.setItems(activityPage.getContent());
		pageDto.setCurrentPage(activityPage.getNumber());
		pageDto.setTotalItems(activityPage.getTotalElements());
		pageDto.setTotalPages(activityPage.getTotalPages());

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getRecordActivities(CrmActivityRecordFilterDto filterDto) {
		log.info("getRecordActivities: execution started");

		if (filterDto.getRecordType() == null || filterDto.getRecordId() == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ERROR);
		}

		User currentUser = userService.getCurrentUser();
		validateRecordAccess(currentUser, filterDto.getRecordType(), filterDto.getRecordId());

		CrmActivityListParams params = new CrmActivityListParams();
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(CrmUtil.isCrmSalesRepresentative(currentUser));
		params.setRecordType(filterDto.getRecordType());
		params.setRecordId(filterDto.getRecordId());
		params.setActivityType(filterDto.getType());
		params.setSearchPattern(filterDto.getSearch());

		Page<CrmActivityRecordRowResponseDto> activityPage = crmActivityFeedRepository.findRecordActivities(params,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		PageDto pageDto = pageTransformer.transform(activityPage);
		pageDto.setItems(activityPage.getContent());

		log.info("getRecordActivities: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private void validateRecordAccess(User currentUser, CrmActivityRecordType recordType, Long recordId) {
		switch (recordType) {
			case CONTACT -> {
				if (!crmContactDao.existsByIdAndIsDeletedFalse(recordId)) {
					throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND);
				}
			}
			case DEAL -> {
				CrmDeal deal = crmDealDao.findByIdWithAssociations(recordId);
				if (deal == null) {
					throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND);
				}
				if (CrmValidations.isOwnerRestrictedForRepresentative(currentUser, deal.getOwner().getEmployeeId())) {
					throw new ModuleException(CrmMessageConstant.CRM_ERROR_DEAL_VIEW_DENIED);
				}
			}
			case COMPANY -> {
				if (!crmCompanyDao.existsByIdAndIsDeletedFalse(recordId)) {
					throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND);
				}
			}
		}
	}

}
