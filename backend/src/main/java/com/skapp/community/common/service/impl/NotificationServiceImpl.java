package com.skapp.community.common.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.response.NotificationResponseDto;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.NotificationDao;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.PushNotificationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

	private static final String NOTIFICATION_LANGUAGE = "en";

	private final PushNotificationService pushNotificationService;

	private final NotificationDao notificationDao;

	private final UserService userService;

	private final PageTransformer pageTransformer;

	private final EmployeeDao employeeDao;

	private final OrganizationService organizationService;

	@Override
	public void createNotification(Employee employee, String resourceId, NotificationType notificationType,
			EmailBodyTemplates emailBodyTemplates, Object dynamicFields, NotificationCategory notificationCategory) {
		log.info("createNotification: execution started");

		try {
			Notification notification = new Notification();
			notification.setEmployee(employee);
			notification.setResourceId(resourceId);

			Map<String, String> notificationContent = getNotificationContent(emailBodyTemplates, dynamicFields,
					notificationCategory);
			String title = notificationContent.get(CommonConstants.NOTIFICATION_TITLE);
			String body = notificationContent.get(CommonConstants.NOTIFICATION_MESSAGE);

			notification.setBody(body);
			notification.setIsViewed(false);
			notification.setNotificationType(notificationType);
			
			if (notification.getCreatedBy() == null && employee != null && employee.getEmployeeId() != null) {
				notification.setCreatedBy(employee.getEmployeeId().toString());
			}
			
			notificationDao.save(notification);

			pushNotificationService.sendNotification(notification.getEmployee().getEmployeeId(), notification, title);
		}
		catch (Exception e) {
			log.error("createNotification: ", e);
			return;
		}

		log.info("createNotification: execution ended");
	}

	private Map<String, String> getNotificationContent(EmailBodyTemplates emailBodyTemplates, Object dynamicFields,
			NotificationCategory notificationCategory) {
		Map<String, String> contentMap = getNotificationContentFromNotificationTemplates(emailBodyTemplates,
				notificationCategory);
		Map<String, String> placeholders = convertObjectToMap(dynamicFields);
		Map<String, Map<String, Map<String, String>>> translations = loadEnumTranslations();
		Map<String, Map<String, String>> languageTranslations = translations.getOrDefault(NOTIFICATION_LANGUAGE,
				new HashMap<>());
		Map<String, String> translatedPlaceholders = placeholders.entrySet()
			.stream()
			.collect(Collectors.toMap(Map.Entry::getKey, entry -> {
				String key = entry.getKey();
				String value = entry.getValue();

				return languageTranslations.containsKey(key) && languageTranslations.get(key).containsKey(value)
						? languageTranslations.get(key).get(value) : value;
			}));

		Map<String, String> result = new HashMap<>();
		result.put(CommonConstants.NOTIFICATION_TITLE,
				replacePlaceholders(contentMap.get(CommonConstants.NOTIFICATION_TITLE), translatedPlaceholders));
		result.put(CommonConstants.NOTIFICATION_MESSAGE,
				replacePlaceholders(contentMap.get(CommonConstants.NOTIFICATION_MESSAGE), translatedPlaceholders));

		return result;
	}

	private String replacePlaceholders(String body, Map<String, String> values) {
		if (body == null || values == null) {
			return body;
		}

		for (Map.Entry<String, String> entry : values.entrySet()) {
			String placeholder = "{{" + entry.getKey() + "}}";
			String value = entry.getValue() != null ? entry.getValue() : "";
			body = body.replace(placeholder, value);
		}

		return body;
	}

	private Map<String, String> convertObjectToMap(Object dynamicFields) {
		if (dynamicFields == null) {
			return Collections.emptyMap();
		}

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			Map<String, Object> fieldValues = objectMapper.convertValue(dynamicFields, new TypeReference<>() {
			});

			return fieldValues.entrySet()
				.stream()
				.collect(Collectors.toMap(Map.Entry::getKey,
						entry -> entry.getValue() != null ? entry.getValue().toString() : ""));
		}
		catch (Exception e) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FAILED_TO_CONVERT_DYNAMIC_VALUES);
		}
	}

	private Map<String, String> getNotificationContentFromNotificationTemplates(EmailBodyTemplates emailBodyTemplates,
			NotificationCategory notificationCategory) {

		InputStream file;
		try {
			file = new ClassPathResource("community/templates/notification/notification-templates.json")
				.getInputStream();
		}
		catch (IOException exception) {
			log.error("Unable to find notification-templates.json file", exception);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NOTIFICATION_TEMPLATE_LOADING_FAILED);
		}

		ObjectMapper objectMapper = new ObjectMapper();
		try {
			JsonNode rootNode = objectMapper.readTree(file);

			JsonNode languageNode = rootNode.path(NOTIFICATION_LANGUAGE);

			if (languageNode.isMissingNode()) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FAILED_TO_LOAD_NOTIFICATION_LANGUAGE,
						new String[] { NOTIFICATION_LANGUAGE });
			}

			JsonNode category = languageNode.path(notificationCategory.getLabel());

			if (category.isMissingNode() || !category.isArray()) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_TEMPLATE_NOT_FOUND_FOR_LANGUAGE,
						new String[] { NOTIFICATION_LANGUAGE });
			}

			for (JsonNode templateNode : category) {
				if (templateNode.path("id").asText().equals(emailBodyTemplates.getTemplateId())) {
					Map<String, String> contentMap = new HashMap<>();
					contentMap.put("title", templateNode.path("title").asText());
					contentMap.put("message", templateNode.path("message").asText());
					log.info("getTemplateFromJson: execution ended");
					return contentMap;
				}
			}

			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_TEMPLATE_ID_NOT_FOUND,
					new String[] { emailBodyTemplates.getTemplateId() });
		}
		catch (IOException e) {
			log.error("Error occurred while parsing the notification templates", e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NOTIFICATION_TEMPLATE_PARSING_FAILED);
		}
	}

	private Map<String, Map<String, Map<String, String>>> loadEnumTranslations() {
		ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
		try (InputStream inputStream = new ClassPathResource("community/templates/common/enum-translations.yml")
			.getInputStream()) {
			return yamlMapper.readValue(inputStream, new TypeReference<>() {
			});
		}
		catch (IOException e) {
			log.error("Failed to load enum-translations.yml: {}", e.getMessage());
			return new HashMap<>();
		}
	}

	@Override
	public ResponseEntityDto getAllNotifications(NotificationsFilterDto notificationsFilterDto) {
		log.info("getAllNotifications: execution started");

		Pageable pageable = PageRequest.of(notificationsFilterDto.getPage(), notificationsFilterDto.getSize(),
				Sort.by(notificationsFilterDto.getSortOrder(), notificationsFilterDto.getSortKey().toString()));

		Long userId = userService.getCurrentUser().getUserId();
		Page<Notification> notificationPage = notificationDao.findAllByUserIDAndNotificationFilterDto(userId,
				notificationsFilterDto, pageable);

		List<NotificationResponseDto> notificationsList = mapNotifications(
				notificationPage.hasContent() ? notificationPage.getContent() : Collections.emptyList());

		PageDto pageDto = pageTransformer.transform(notificationPage);
		pageDto.setItems(notificationsList);

		log.info("getAllNotifications: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	public ResponseEntityDto markNotificationAsRead(Long id) {
		log.info("markNotificationAsRead: execution started");

		User currentUser = userService.getCurrentUser();

		Optional<Notification> optionalNotification = notificationDao.findById(id);
		if (optionalNotification.isEmpty()
				|| !Objects.equals(optionalNotification.get().getEmployee().getEmployeeId(), currentUser.getUserId())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NOTIFICATION_NOT_FOUND);
		}
		Notification notification = optionalNotification.get();

		notification.setIsViewed(true);
		notificationDao.save(notification);

		log.info("markNotificationAsRead: execution ended");
		return new ResponseEntityDto(false, "");
	}

	@Transactional
	@Override
	public ResponseEntityDto markAllNotificationsAsRead() {
		log.info("markAllNotificationsAsRead: execution started");

		User currentUser = userService.getCurrentUser();

		List<Notification> notifications = notificationDao.findByEmployee(currentUser.getEmployee());
		notifications.forEach(notification -> notification.setIsViewed(true));

		notificationDao.saveAll(notifications);

		log.info("markAllNotificationsAsRead: execution ended");
		return new ResponseEntityDto(false, "");
	}

	@Override
	public ResponseEntityDto getUnreadNotificationsCount() {
		log.info("getUnreviewedNotificationsCount: execution started");

		Long userId = userService.getCurrentUser().getUserId();
		long unreadCount = notificationDao.countUnreadNotificationsByUserId(userId);

		log.info("getUnreviewedNotificationsCount: execution ended");
		return new ResponseEntityDto(false, unreadCount);
	}

	public List<NotificationResponseDto> mapNotifications(List<Notification> notifications) {

		String organizationTimeZone = organizationService.getOrganizationTimeZone();

		return notifications.stream().map(notification -> {
			NotificationResponseDto notificationResponseDto = new NotificationResponseDto();
			notificationResponseDto.setId(notification.getId());
			notificationResponseDto
				.setCreatedDate(convertToOrganizationTimeZone(notification.getCreatedDate(), organizationTimeZone));
			notificationResponseDto.setBody(notification.getBody());
			notificationResponseDto.setIsViewed(notification.getIsViewed());
			notificationResponseDto.setResourceId(notification.getResourceId());
			notificationResponseDto.setNotificationType(notification.getNotificationType());
			notificationResponseDto.setIsCausedByCurrentUser(
					notification.getCreatedBy().equals(userService.getCurrentUser().getUserId().toString()));

			String createdBy = notification.getCreatedBy();
			if (createdBy != null) {
				Employee employee = employeeDao.getEmployeeByEmployeeId(Long.parseLong(createdBy));
				if (employee != null) {
					notificationResponseDto.setAuthPic(employee.getAuthPic());
				}
			}

			return notificationResponseDto;
		}).toList();
	}

	private LocalDateTime convertToOrganizationTimeZone(LocalDateTime createdDate, String organizationTimeZone) {
		if (createdDate == null)
			return null;
		ZonedDateTime utcTime = createdDate.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneId.of("UTC"));
		return utcTime.withZoneSameInstant(ZoneId.of(organizationTimeZone)).toLocalDateTime();
	}

}
