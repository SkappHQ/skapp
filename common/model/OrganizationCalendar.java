package com.skapp.enterprise.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "organization_calendar")
public class OrganizationCalendar {

	@Id
	@Column(name = "is_google_calendar_enabled")
	private Boolean isGoogleCalendarEnabled = false;

	@Column(name = "is_microsoft_calendar_enabled")
	private Boolean isMicrosoftCalendarEnabled = false;

}
