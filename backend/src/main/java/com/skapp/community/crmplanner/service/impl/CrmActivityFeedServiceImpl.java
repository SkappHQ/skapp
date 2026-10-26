package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.type.CrmActivityFeedFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityType;
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
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

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

		CrmActivityFeedFilterParams params = buildParams(currentUser, isRepresentative, filterDto);
		Page<CrmActivityFeedRowResponseDto> activityPage = crmActivityFeedRepository.findActivities(params,
				PageRequest.of(filterDto.getPage(), filterDto.getSize()));

		List<CrmActivityFeedRowResponseDto> rows = activityPage.getContent();
		rows.stream().filter(row -> row.getType() == CrmActivityType.TASK).forEach(row -> row.setCanComplete(true));
		fillNames(rows);

		PageDto pageDto = new PageDto();
		pageDto.setItems(rows);
		pageDto.setCurrentPage(activityPage.getNumber());
		pageDto.setTotalItems(activityPage.getTotalElements());
		pageDto.setTotalPages(activityPage.getTotalPages());

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	private CrmActivityFeedFilterParams buildParams(User currentUser, boolean isRepresentative,
			CrmActivityFeedFilterDto filterDto) {
		ZoneId zone = timeZoneService.requestTimezone();
		CrmActivityFeedFilterParams params = new CrmActivityFeedFilterParams();
		params.setTypes(
				filterDto.getType() == null ? EnumSet.allOf(CrmActivityType.class) : EnumSet.of(filterDto.getType()));
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);
		params.setOwnerId(filterDto.getOwnerId());
		params.setSortOrder(Sort.Direction.DESC);
		if (!StringUtils.isNullOrBlank(filterDto.getSearch())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearch().trim().toLowerCase()) + "%");
		}
		if (filterDto.getFromDate() != null) {
			params.setRangeStart(filterDto.getFromDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getToDate() != null) {
			params.setRangeEnd(filterDto.getToDate().plusDays(1).atStartOfDay(zone).toInstant());
		}
		return params;
	}

	private void fillNames(List<CrmActivityFeedRowResponseDto> rows) {
		Set<Long> contactIds = new HashSet<>();
		Set<Long> dealIds = new HashSet<>();
		Set<Long> companyIds = new HashSet<>();
		rows.forEach(row -> {
			row.getContacts().forEach(contact -> contactIds.add(contact.getId()));
			if (row.getDeal() != null) {
				dealIds.add(row.getDeal().getId());
			}
			if (row.getCompany() != null) {
				companyIds.add(row.getCompany().getId());
			}
		});

		Map<Long, CrmContact> contacts = crmContactDao.findAllById(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmContact::getId, Function.identity()));
		Map<Long, CrmDeal> deals = crmDealDao.findAllById(dealIds)
			.stream()
			.collect(Collectors.toMap(CrmDeal::getId, Function.identity()));
		Map<Long, CrmCompany> companies = crmCompanyDao.findAllById(companyIds)
			.stream()
			.collect(Collectors.toMap(CrmCompany::getId, Function.identity()));

		rows.forEach(row -> {
			row.getContacts().forEach(link -> {
				CrmContact contact = contacts.get(link.getId());
				if (contact != null) {
					link.setName(contact.getName());
					link.setIsDeleted(Boolean.TRUE.equals(contact.getIsDeleted()));
				}
			});
			CrmDeal deal = row.getDeal() == null ? null : deals.get(row.getDeal().getId());
			if (deal != null) {
				row.getDeal().setName(deal.getName());
				row.getDeal().setIsDeleted(Boolean.TRUE.equals(deal.getIsDeleted()));
			}
			CrmCompany company = row.getCompany() == null ? null : companies.get(row.getCompany().getId());
			if (company != null) {
				row.getCompany().setName(company.getName());
				row.getCompany().setIsDeleted(Boolean.TRUE.equals(company.getIsDeleted()));
			}
		});
	}

}
