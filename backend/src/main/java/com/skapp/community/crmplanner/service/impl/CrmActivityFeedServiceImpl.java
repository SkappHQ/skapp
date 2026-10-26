package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private final UserService userService;

	private final CrmActivityFeedRepository crmActivityFeedRepository;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		User currentUser = userService.getCurrentUser();
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		if (isRepresentative) {
			filterDto.setOwnerId(null);
			filterDto.setFromDate(null);
			filterDto.setToDate(null);
		}
		CrmValidations.validateActivityDateRange(filterDto.getFromDate(), filterDto.getToDate());

		Page<CrmActivityFeedRowResponseDto> activityPage = crmActivityFeedRepository.findActivities(filterDto,
				currentUser.getEmployee().getEmployeeId(), isRepresentative,
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
