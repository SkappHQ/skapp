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

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_contact")
public class CrmContact {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "email", nullable = false)
	private String email;

	@Column(name = "contact_number", length = 50)
	private String contactNumber;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_id")
	private CrmCompany company;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_id", nullable = false)
	private Employee owner;

	@Column(name = "is_active")
	private Boolean isActive = true;

}
