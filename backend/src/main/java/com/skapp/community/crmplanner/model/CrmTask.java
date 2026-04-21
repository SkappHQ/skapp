package com.skapp.community.crmplanner.model;

import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_task")
public class CrmTask {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "type_id", nullable = false)
	private CrmTaskType type;

	@Column(name = "priority", nullable = false, length = 50)
	private String priority;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "stage_id", nullable = false)
	private CrmTaskStage stage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "status_id", nullable = false)
	private CrmTaskStatus status;

	@Column(name = "closing_date")
	private LocalDateTime closingDate;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", nullable = false)
	private Employee owner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contact_id")
	private CrmContact contact;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_id")
	private CrmCompany company;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deal_id")
	private CrmDeal deal;

	@Column(name = "is_active")
	private Boolean isActive = true;

}
