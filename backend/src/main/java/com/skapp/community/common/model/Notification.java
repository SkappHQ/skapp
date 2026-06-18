package com.skapp.community.common.model;

import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "notification")
public class Notification extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id")
	private Employee employee;

	@Column(name = "body")
	private String body;

	@Column(name = "is_viewed")
	private Boolean isViewed = false;

	@Column(name = "is_type_viewed")
	private Boolean isTypeViewed = false;

	@Enumerated(EnumType.STRING)
	@Column(name = "notification_type", columnDefinition = "varchar(255)")
	private NotificationType notificationType;

	@Column(name = "resource_id", updatable = false)
	private String resourceId;

}
