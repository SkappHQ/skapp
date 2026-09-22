package com.skapp.community.common.model;

import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@IdClass(SpecialNotificationStatusId.class)
@Table(name = "com_special_notification_status")
public class SpecialNotificationStatus extends Auditable<String> {

	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "special_notification_type", nullable = false)
	private SpecialNotificationType specialNotificationType;

	@Column(name = "last_viewed_date", nullable = false)
	private LocalDate lastViewedDate;

}
