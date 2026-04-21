package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_company")
public class CrmCompany {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name", nullable = false, unique = true)
	private String name;

	@Column(name = "industry")
	private String industry;

	@Column(name = "website", unique = true)
	private String website;

	@Column(name = "address")
	private String address;

	@Column(name = "company_contact")
	private String companyContact;

	@Column(name = "is_active")
	private Boolean isActive = true;

}
