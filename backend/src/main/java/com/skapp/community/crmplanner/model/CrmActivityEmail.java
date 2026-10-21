package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.Auditable;
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

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_activity_email")
public class CrmActivityEmail extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private Long id;

	@Column(name = "subject")
	private String subject;

	@Column(name = "logged_at")
	private Instant loggedAt;

	@Column(name = "description")
	private String description;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id")
	private Employee owner;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "deal_id")
	private CrmDeal deal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_id")
	private CrmCompany company;

	@Column(name = "is_deleted")
	private Boolean isDeleted = false;

}
