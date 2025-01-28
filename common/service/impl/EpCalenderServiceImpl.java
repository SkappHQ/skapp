package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.service.EpCalenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpCalenderServiceImpl implements EpCalenderService {

	private final ObjectMapper mapper;

	private final OrganizationConfigDao organizationConfigDao;

	@Override
	public void saveDefaultCalenderConfigs() {
		log.info("saveDefaultCalenderConfigs: execution started");
		ArrayNode calendarConfigs = getCalendarConfigs(false, false);
		try {
			String jsonObject = mapper.writeValueAsString(calendarConfigs);
			organizationConfigDao.save(new OrganizationConfig(OrganizationConfigType.CALENDAR_CONFIGS, jsonObject));
		}
		catch (JsonProcessingException e) {
			log.error("saveDefaultCalenderConfigs: An error occurred while converting object node to JSON string: {}",
					e.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}
	}

	private ArrayNode getCalendarConfigs(Boolean isGoogleCalendarEnabled, Boolean isOutLookCalendarEnabled) {
		ArrayNode calendars = JsonNodeFactory.instance.arrayNode();

		ObjectNode googleCalendar = JsonNodeFactory.instance.objectNode();
		googleCalendar.set(EpCommonConstants.ENTERPRISE_CALENDER_TYPE,
				JsonNodeFactory.instance.textNode(EpCommonConstants.ENTERPRISE_CALENDER_TYPE_GOOGLE));
		googleCalendar.set(EpCommonConstants.ENTERPRISE_CALENDER_IS_ENABLED,
				JsonNodeFactory.instance.booleanNode(isGoogleCalendarEnabled));

		ObjectNode outlookCalendar = JsonNodeFactory.instance.objectNode();
		outlookCalendar.set(EpCommonConstants.ENTERPRISE_CALENDER_TYPE,
				JsonNodeFactory.instance.textNode(EpCommonConstants.ENTERPRISE_CALENDER_TYPE_OUTLOOK));
		outlookCalendar.set(EpCommonConstants.ENTERPRISE_CALENDER_IS_ENABLED,
				JsonNodeFactory.instance.booleanNode(isOutLookCalendarEnabled));

		calendars.add(googleCalendar);
		calendars.add(outlookCalendar);

		return calendars;
	}

}
