package com.skapp.community.crmplanner.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skapp.community.common.model.Auditable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_company")
public class CrmCompany extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "industry")
	private String industry;

	@Column(name = "website")
	private String website;

	@Column(name = "address")
	private String address;

	@Column(name = "contact_number")
	private String contactNumber;

	@Column(name = "is_deleted", nullable = false)
	private Boolean isDeleted = false;

	@JsonIgnore
	@OneToMany(mappedBy = "company")
	private List<CrmTask> tasks;

	@JsonIgnore
	@OneToMany(mappedBy = "company")
	private List<CrmDeal> deals;

}