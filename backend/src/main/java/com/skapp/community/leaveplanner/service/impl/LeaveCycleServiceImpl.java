package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.payload.LeaveCycleDetailsDto;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.peopleplanner.type.LeaveCycleConfigField;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

import java.time.LocalDate;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveCycleServiceImpl implements LeaveCycleService {

	private final OrganizationConfigDao organizationConfigDao;

	private final JsonMapper mapper;

	@Override
	public LeaveCycleDetailsDto getLeaveCycleConfigs() {
		Map<String, Object> leaveCycle = null;
		Optional<OrganizationConfig> organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.LEAVE_CYCLE.name());

		if (organizationConfig.isPresent() && Objects.equals(organizationConfig.get().getOrganizationConfigType(),
				OrganizationConfigType.LEAVE_CYCLE.name())) {

			leaveCycle = mapper.readValue(organizationConfig.get().getOrganizationConfigValue(), new TypeReference<>() {
			});

		}

		JsonNode leaveCycleJson;
		String jsonString = mapper.writeValueAsString(leaveCycle);
		leaveCycleJson = mapper.readTree(jsonString);

		LeaveCycleDetailsDto leaveCycleDetail = new LeaveCycleDetailsDto();

		leaveCycleDetail.setStartDate(leaveCycleJson.get(LeaveCycleConfigField.START.getField())
			.get(LeaveCycleConfigField.DATE.getField())
			.intValue());
		leaveCycleDetail.setStartMonth(leaveCycleJson.get(LeaveCycleConfigField.START.getField())
			.get(LeaveCycleConfigField.MONTH.getField())
			.intValue());
		leaveCycleDetail.setEndDate(leaveCycleJson.get(LeaveCycleConfigField.END.getField())
			.get(LeaveCycleConfigField.DATE.getField())
			.intValue());
		leaveCycleDetail.setEndMonth(leaveCycleJson.get(LeaveCycleConfigField.END.getField())
			.get(LeaveCycleConfigField.MONTH.getField())
			.intValue());
		leaveCycleDetail.setIsDefault(leaveCycleJson.get(LeaveCycleConfigField.IS_DEFAULT.getField()).asBoolean());

		return leaveCycleDetail;
	}

	@Override
	public LocalDate getLeaveCycleStartDate() {
		LocalDate date = getLocalDateFromNode(LeaveCycleConfigField.START.getField());
		if (date == null) {
			date = DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), DateTimeUtils.JANUARY,
					DateTimeUtils.FIRST_DAY);
		}
		return date;
	}

	@Override
	public LocalDate getLeaveCycleEndDate() {
		LocalDate date = getLocalDateFromNode(LeaveCycleConfigField.END.getField());
		if (date == null) {
			date = DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), DateTimeUtils.DECEMBER,
					DateTimeUtils.LAST_DAY); // December 31
		}
		return date;
	}

	@Override
	public boolean isInNextCycle(int startYear) {
		int currentYear = DateTimeUtils.getCurrentYear();

		LocalDate validFrom = DateTimeUtils.getUtcLocalDate(currentYear + 1, DateTimeUtils.JANUARY,
				DateTimeUtils.FIRST_DAY);
		LocalDate validTo = DateTimeUtils.getUtcLocalDate(currentYear + 1, DateTimeUtils.DECEMBER,
				DateTimeUtils.LAST_DAY);

		if (validFrom.getMonthValue() != DateTimeUtils.JANUARY && validTo.getMonthValue() != DateTimeUtils.DECEMBER) {
			validTo = validTo.plusYears(1L);
		}
		return validFrom.getYear() == startYear || validTo.getYear() == startYear;
	}

	@Override
	public boolean isInCurrentCycle(int year) {
		int currentYear = DateTimeUtils.getCurrentYear();

		LocalDate validFrom = DateTimeUtils.getUtcLocalDate(currentYear, DateTimeUtils.JANUARY,
				DateTimeUtils.FIRST_DAY);
		LocalDate validTo = DateTimeUtils.getUtcLocalDate(currentYear, DateTimeUtils.DECEMBER, DateTimeUtils.LAST_DAY);

		if (validFrom.getMonthValue() != DateTimeUtils.JANUARY && validTo.getMonthValue() != DateTimeUtils.DECEMBER) {
			validTo = validTo.plusYears(1L);
		}
		return validFrom.getYear() == year || validTo.getYear() == year;
	}

	@Override
	public boolean isInPreviousCycle(int year) {
		int currentYear = DateTimeUtils.getCurrentYear();

		LocalDate validFrom = DateTimeUtils.getUtcLocalDate(currentYear - 1, DateTimeUtils.JANUARY,
				DateTimeUtils.FIRST_DAY);
		LocalDate validTo = DateTimeUtils.getUtcLocalDate(currentYear - 1, DateTimeUtils.DECEMBER,
				DateTimeUtils.LAST_DAY);

		if (validFrom.getMonthValue() != DateTimeUtils.JANUARY && validTo.getMonthValue() != DateTimeUtils.DECEMBER) {
			validFrom = validFrom.minusYears(1L);
		}
		return validFrom.getYear() == year || validTo.getYear() == year;
	}

	private LocalDate getLocalDateFromNode(String dateType) {
		LeaveCycleDetailsDto leaveCycleConfigs = getLeaveCycleConfigs();
		int month;
		int day;

		if (dateType.equals(LeaveCycleConfigField.START.getField())) {
			month = leaveCycleConfigs.getStartMonth();
			day = leaveCycleConfigs.getStartDate();
		}
		else {
			month = leaveCycleConfigs.getEndMonth();
			day = leaveCycleConfigs.getEndDate();
		}

		int currentYear = DateTimeUtils.getCurrentYear();

		try {
			return DateTimeUtils.getUtcLocalDate(currentYear, month, day);
		}
		catch (Exception e) {
			log.error("Error creating {} date: {}", dateType, e.getMessage());
			return null;
		}
	}

	@Override
	public void setLeaveCycleDefaultConfigs() {
		log.info("setLeaveCycleDefaultConfigs: execution started");
		ObjectNode leaveCycle = saveLeaveCycleConfigs(1, 1, true);
		String jsonObject = mapper.writeValueAsString(leaveCycle);
		organizationConfigDao.save(new OrganizationConfig(OrganizationConfigType.LEAVE_CYCLE.name(), jsonObject));
	}

	private ObjectNode saveLeaveCycleConfigs(int startMonth, int startDate, boolean isDefault) {

		LocalDate cycleStartDate = DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), startMonth, startDate);
		LocalDate cycleEndDate = DateTimeUtils.calculateEndDateAfterYears(cycleStartDate, 1);

		int cycleEndMonth = DateTimeUtils.getMonthValue(cycleEndDate);
		int cycleEndDay = DateTimeUtils.getDayOfMonth(cycleEndDate);

		ObjectNode leaveCycle = mapper.createObjectNode();
		ObjectNode start = mapper.createObjectNode();
		ObjectNode end = mapper.createObjectNode();

		start.put(LeaveModuleConstant.MONTH, startMonth);
		start.put(LeaveModuleConstant.DATE, startDate);

		end.put(LeaveModuleConstant.MONTH, cycleEndMonth);
		end.put(LeaveModuleConstant.DATE, cycleEndDay);

		leaveCycle.set(LeaveModuleConstant.START, start);
		leaveCycle.set(LeaveModuleConstant.END, end);
		leaveCycle.put(LeaveModuleConstant.IS_DEFAULT, isDefault);

		return leaveCycle;
	}

}
