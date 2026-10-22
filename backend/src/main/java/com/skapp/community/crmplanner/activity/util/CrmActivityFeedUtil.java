package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityLinkResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import lombok.experimental.UtilityClass;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@UtilityClass
public class CrmActivityFeedUtil {

	public String toFullName(String firstName, String lastName) {
		return Stream.of(firstName, lastName)
			.filter(part -> !StringUtils.isNullOrBlank(part))
			.map(String::trim)
			.collect(Collectors.joining(" "));
	}

	public String toSearchPattern(String search) {
		if (StringUtils.isNullOrBlank(search)) {
			return null;
		}
		return "%" + StringUtils.escapeLikePattern(search.trim().toLowerCase(Locale.ROOT)) + "%";
	}

	public Instant toRangeStart(LocalDate from, ZoneId zone) {
		return from == null ? null : from.atStartOfDay(zone).toInstant();
	}

	public Instant toRangeEndExclusive(LocalDate to, ZoneId zone) {
		return to == null ? null : to.plusDays(1).atStartOfDay(zone).toInstant();
	}

	public CrmActivityFeedRowResponseDto toRow(CrmActivityFeedRecord activity, CrmActivityScope scope,
			List<CrmActivityLinkResponseDto> linkedContacts) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(activity.id());
		row.setType(activity.type());
		row.setSubject(activity.subject());

		if (activity.type() == CrmActivityType.TASK) {
			boolean completed = Boolean.TRUE.equals(activity.isCompleted());
			row.setDueAt(activity.dueAt());
			row.setCompletedAt(activity.completedAt());
			row.setIsCompleted(completed);
			row.setPriority(activity.priority());
			row.setOccurredAt(!completed && activity.dueAt() == null ? activity.createdDate() : null);
			row.setCanComplete(scope.includesOwner(activity.ownerId()));
		}
		else {
			row.setOccurredAt(activity.occurredAt() != null ? activity.occurredAt() : activity.createdDate());
			row.setIsCompleted(false);
			row.setCanComplete(false);
		}

		row.setOwner(activity.ownerId() == null ? null : new CrmActivityPersonResponseDto(activity.ownerId(),
				activity.ownerFirstName(), activity.ownerLastName(), activity.ownerAuthPic()));
		row.setContacts(resolveContacts(activity, linkedContacts));
		row.setDeal(scope.canViewDeal(activity.dealOwnerId())
				? toLink(activity.dealId(), activity.dealName(), activity.dealDeleted()) : null);
		row.setCompany(toLink(activity.companyId(), activity.companyName(), activity.companyDeleted()));
		return row;
	}

	private List<CrmActivityLinkResponseDto> resolveContacts(CrmActivityFeedRecord activity,
			List<CrmActivityLinkResponseDto> linkedContacts) {
		if (activity.type() == CrmActivityType.MEETING || activity.type() == CrmActivityType.EMAIL) {
			return linkedContacts;
		}

		return activity.contactId() == null ? List.of()
				: List.of(toLink(activity.contactId(), activity.contactName(), activity.contactDeleted()));
	}

	private CrmActivityLinkResponseDto toLink(Long id, String name, Boolean deleted) {
		return id == null ? null : new CrmActivityLinkResponseDto(id, name, Boolean.TRUE.equals(deleted));
	}

}
