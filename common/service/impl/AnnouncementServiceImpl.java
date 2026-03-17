package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.model.AnnouncementUserInteraction;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.payload.response.FeatureAnnouncementResponseDto;
import com.skapp.enterprise.common.repository.AnnouncementUserInteractionDao;
import com.skapp.enterprise.common.masterrepository.FeatureAnnouncementDao;
import com.skapp.enterprise.common.service.AnnouncementService;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.enterprise.common.type.AnnouncementInteractionType;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

	private final AnnouncementUserInteractionDao interactionDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final UserService userService;

	private final FeatureAnnouncementDao featureAnnouncementDao;

	private final TenantContext tenantContext;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEligibleAnnouncements() {

		List<FeatureAnnouncementResponseDto> active = fetchActiveAnnouncements();
		if (active.isEmpty()) {
			return new ResponseEntityDto(false, Collections.emptyList());
		}

		User currentUser = userService.getCurrentUser();
		Long employeeId = currentUser.getEmployee().getEmployeeId();
		EmployeeRole employeeRole = employeeRoleDao.findById(employeeId).orElse(null);

		List<FeatureAnnouncementResponseDto> filtered = active.stream()
			.filter(a -> isUserEligibleByRole(employeeRole, a.getRecipientRoles()))
			.toList();

		if (filtered.isEmpty()) {
			return new ResponseEntityDto(false, Collections.emptyList());
		}

		List<Long> announcementIds = filtered.stream()
			.map(FeatureAnnouncementResponseDto::getAnnouncementId)
			.toList();
		Map<Long, AnnouncementUserInteraction> interactionMap = interactionDao
				.findAllByEmployeeIdAndAnnouncementIdIn(employeeId, announcementIds)
				.stream()
				.collect(Collectors.toMap(i -> i.getAnnouncementId(), i -> i));

		List<FeatureAnnouncementResponseDto> eligible = filtered.stream()
			.filter(a -> isFrequencyEligible(a, interactionMap.get(a.getAnnouncementId())))
			.toList();

		return new ResponseEntityDto(false, eligible);
	}

	@Override
	@Transactional
	public ResponseEntityDto recordInteraction(Long announcementId, AnnouncementInteractionType type) {

		User currentUser = userService.getCurrentUser();
		Long employeeId = currentUser.getEmployee().getEmployeeId();

		AnnouncementUserInteraction interaction = interactionDao
				.findByEmployeeIdAndAnnouncementId(employeeId, announcementId)
				.orElse(null);

		if (interaction == null) {
			interaction = new AnnouncementUserInteraction();
			interaction.setAnnouncementId(announcementId);
			interaction.setEmployeeId(employeeId);
			interaction.setInteractionType(type);
			interaction.setLastSeenAt(LocalDateTime.now());
		}
		else {
			interaction.setInteractionType(type);
			interaction.setLastSeenAt(LocalDateTime.now());
		}

		interactionDao.save(interaction);
		return new ResponseEntityDto(false, "Interaction recorded");
	}

	protected List<FeatureAnnouncementResponseDto> fetchActiveAnnouncements() {
		String currentTenant = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		List<FeatureAnnouncementResponseDto> announcements = featureAnnouncementDao
				.findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus.ACTIVE)
				.stream()
				.map(this::buildAnnouncementResponseDto)
				.toList();

		if (currentTenant != null) {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}

		return announcements;
	}

	private boolean isUserEligibleByRole(EmployeeRole employeeRole, List<Role> recipientRoles) {
		if (recipientRoles == null || recipientRoles.isEmpty()) {
			return false;
		}
		for (Role role : recipientRoles) {
			if (matchesRole(employeeRole, role)) {
				return true;
			}
		}
		return false;
	}

	private boolean matchesRole(EmployeeRole employeeRole, Role role) {
		if (employeeRole == null) {
			return false;
		}
		return switch (role) {
			case SUPER_ADMIN                                        -> Boolean.TRUE.equals(employeeRole.getIsSuperAdmin());
			case PEOPLE_ADMIN, PEOPLE_MANAGER, PEOPLE_EMPLOYEE     -> employeeRole.getPeopleRole() == role;
			case LEAVE_ADMIN, LEAVE_MANAGER, LEAVE_EMPLOYEE        -> employeeRole.getLeaveRole() == role;
			case ATTENDANCE_ADMIN, ATTENDANCE_MANAGER,
					ATTENDANCE_EMPLOYEE                             -> employeeRole.getAttendanceRole() == role;
			case ESIGN_ADMIN, ESIGN_SENDER, ESIGN_EMPLOYEE         -> employeeRole.getEsignRole() == role;
			case INVOICE_ADMIN, INVOICE_MANAGER, INVOICE_NONE      -> employeeRole.getInvoiceRole() == role;
			case PM_ADMIN, PM_EMPLOYEE, PM_GUEST_EMPLOYEE          -> employeeRole.getPmRole() == role;
			case OKR_ADMIN, OKR_MANAGER, OKR_EMPLOYEE              -> employeeRole.getOkrRole() == role;
		};
	}

	private boolean isFrequencyEligible(FeatureAnnouncementResponseDto announcement, AnnouncementUserInteraction interaction) {
		AnnouncementFrequencyType frequency = announcement.getFrequencyType();
		if (frequency == null) {
			return true;
		}
		return switch (frequency) {
			case ONE_TIME -> interaction == null;
			case DAILY -> interaction == null || interaction.getLastSeenAt() == null
					|| interaction.getLastSeenAt().toLocalDate().isBefore(LocalDate.now());
			case WEEKLY -> interaction == null || interaction.getLastSeenAt() == null
					|| isBeforeStartOfCurrentWeek(interaction.getLastSeenAt());
			case CUSTOM -> interaction == null || interaction.getLastSeenAt() == null
					|| isBeforeCustomDays(interaction.getLastSeenAt(), announcement.getCustomFrequencyDays());
		};
	}

	private boolean isBeforeStartOfCurrentWeek(LocalDateTime lastSeenAt) {
		LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);
		return lastSeenAt.toLocalDate().isBefore(startOfWeek);
	}

	private boolean isBeforeCustomDays(LocalDateTime lastSeenAt, Integer customDays) {
		if (customDays == null || customDays < 1) {
			return true;
		}
		LocalDate threshold = LocalDate.now().minusDays(customDays);
		return lastSeenAt.toLocalDate().isBefore(threshold) || lastSeenAt.toLocalDate().isEqual(threshold);
	}

	private FeatureAnnouncementResponseDto buildAnnouncementResponseDto(FeatureAnnouncement announcement) {
		FeatureAnnouncementResponseDto response = new FeatureAnnouncementResponseDto();
		response.setAnnouncementId(announcement.getAnnouncementId());
		response.setTitle(announcement.getTitle());
		response.setDescription(announcement.getDescription());
		response.setCtaLabel(announcement.getCtaLabel());
		response.setCtaLink(announcement.getCtaLink());
		response.setTargetPage(announcement.getTargetPage());
		response.setTriggerType(announcement.getTriggerType());
		response.setFrequencyType(announcement.getFrequencyType());
		response.setCustomFrequencyDays(announcement.getCustomFrequencyDays());
		response.setStatus(announcement.getStatus());
		response.setImagePath(announcement.getImagePath());
		response.setCreatedDate(announcement.getCreatedDate() == null ? null
				: announcement.getCreatedDate().toInstant(ZoneOffset.UTC));
		List<Role> recipientRoles = announcement.getRecipients().stream()
				.map(r -> r.getRecipientRole())
				.toList();
		response.setRecipientRoles(recipientRoles);
		return response;
	}

}
