package com.skapp.enterprise.common.model;

import com.skapp.community.common.model.User;
import com.skapp.enterprise.common.type.EpCalendarType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "employee_calendar")
public class EmployeeCalendar {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "calendar_id", nullable = false, updatable = false)
	private Long calendarId;

	@OneToOne
	@MapsId
	@JoinColumn(name = "user_id")
	private User user;

	@Column(name = "calendar_token")
	private String calendarToken;

	@Enumerated(EnumType.STRING)
	@Column(name = "integrated_calendar", columnDefinition = "varchar(255)")
	private EpCalendarType calendarType = EpCalendarType.NONE;

	@Column(name = "is_enabled")
	private Boolean isEnabled = true;

}
