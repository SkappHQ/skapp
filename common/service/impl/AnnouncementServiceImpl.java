package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.mapper.AnnouncementMapper;
import com.skapp.enterprise.common.model.AnnouncementUserInteraction;
import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.payload.response.FeatureAnnouncementResponseDto;
import com.skapp.enterprise.common.repository.AnnouncementUserInteractionDao;
import com.skapp.enterprise.common.repository.FeatureAnnouncementDao;
import com.skapp.enterprise.common.service.AnnouncementService;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.enterprise.common.type.AnnouncementInteractionType;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

	private final AnnouncementMapper announcementMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEligibleAnnouncements(AnnouncementTriggerType trigger, String targetPage) {

		List<FeatureAnnouncementResponseDto> active = fetchActiveAnnouncements();
		if (active.isEmpty()) {
			return new ResponseEntityDto(false, Collections.emptyList());
		}

		User currentUser = userService.getCurrentUser();
		Long employeeId = currentUser.getEmployee().getEmployeeId();
		EmployeeRole employeeRole = employeeRoleDao.findById(employeeId).orElse(null);

		List<FeatureAnnouncementResponseDto> filtered = active.stream()
			.filter(a -> matchesTrigger(a, trigger))
			.filter(a -> matchesTargetPage(a, targetPage))
			.filter(a -> isUserEligibleByRole(employeeRole, a.getRecipientRoles()))
			.toList();

		if (filtered.isEmpty()) {
			return new ResponseEntityDto(false, Collections.emptyList());
		}

		List<Long> announcementIds = filtered.stream()
			.map(FeatureAnnouncementResponseDto::getAnnouncementId)
			.toList();
		Map<Long, AnnouncementUserInteraction> interactionMap = interactionDao
				.findAllByEmployee_EmployeeIdAndAnnouncement_AnnouncementIdIn(employeeId, announcementIds)
				.stream()
				.collect(Collectors.toMap(i -> i.getAnnouncement().getAnnouncementId(), i -> i));

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
		Employee employee = currentUser.getEmployee();

		FeatureAnnouncement featureAnnouncement = featureAnnouncementDao.getReferenceById(announcementId);

		AnnouncementUserInteraction interaction = interactionDao
				.findByEmployee_EmployeeIdAndAnnouncement_AnnouncementId(employeeId, announcementId)
				.orElse(null);

		if (interaction == null) {
			interaction = new AnnouncementUserInteraction();
			interaction.setAnnouncement(featureAnnouncement);
			interaction.setEmployee(employee);
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
		if (currentTenant != null) {
			log.debug("fetchActiveAnnouncements: switching from tenant '{}' to master", currentTenant);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		}
		try {
			return featureAnnouncementDao.findAllByStatusOrderByCreatedDateDesc(AnnouncementStatus.ACTIVE)
				.stream()
				.map(announcementMapper::featureAnnouncementToResponseDto)
				.toList();
		}
		finally {
			if (currentTenant != null) {
				tenantContext.setTenantAndSwitchSchema(currentTenant);
				log.debug("fetchActiveAnnouncements: restored schema to tenant '{}'", currentTenant);
			}
		}
	}

	private boolean matchesTrigger(FeatureAnnouncementResponseDto announcement, AnnouncementTriggerType trigger) {
		if (trigger == null) {
			return true;
		}
		return trigger == announcement.getTriggerType();
	}

	private boolean matchesTargetPage(FeatureAnnouncementResponseDto announcement, String targetPage) {
		AnnouncementTriggerType trigger = announcement.getTriggerType();
		if (trigger != AnnouncementTriggerType.ON_FIRST_VISIT && trigger != AnnouncementTriggerType.ON_EVERY_VISIT) {
			return true;
		}
		if (targetPage == null || targetPage.isBlank()) {
			return true;
		}
		return announcement.getTargetPage() != null
				&& announcement.getTargetPage().name().equalsIgnoreCase(targetPage);
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

}
