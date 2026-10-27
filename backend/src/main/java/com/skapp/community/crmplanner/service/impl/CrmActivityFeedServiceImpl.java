package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
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

}
