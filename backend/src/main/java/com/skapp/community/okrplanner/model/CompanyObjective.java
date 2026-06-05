package com.skapp.community.okrplanner.model;

import com.skapp.community.okrplanner.type.OkrTimePeriod;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "okr_company_objective")
@Getter
@Setter
public class CompanyObjective {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "title")
	private String title;

	@Column(name = "description")
	private String description;

	@Column(name = "year")
	private Integer year;

	@Enumerated(EnumType.STRING)
	@Column(name = "time_period")
	private OkrTimePeriod timePeriod;

}
