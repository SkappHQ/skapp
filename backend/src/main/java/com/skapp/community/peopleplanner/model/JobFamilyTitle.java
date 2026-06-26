package com.skapp.community.peopleplanner.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
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
@Table(name = "job_family_title")
@IdClass(JobFamilyTitleId.class)
public class JobFamilyTitle {

	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "job_family_id")
	private JobFamily jobFamily;

	@Id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "job_title_id")
	private JobTitle jobTitle;

}
