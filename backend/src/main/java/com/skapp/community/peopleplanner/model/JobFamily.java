package com.skapp.community.peopleplanner.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "job_family")
public class JobFamily {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "job_family_id")
	private Long jobFamilyId;

	@Column(name = "name", nullable = false, length = 50)
	private String name;

	@Column(name = "is_active", nullable = false)
	private boolean isActive = true;

	@ManyToMany(targetEntity = JobTitle.class, cascade = { CascadeType.ALL })
	@JoinTable(name = "job_family_title", joinColumns = { @JoinColumn(name = "job_family_id") },
			inverseJoinColumns = { @JoinColumn(name = "job_title_id") })
	private Set<JobTitle> jobTitles;

	@OneToMany(mappedBy = "jobFamily", fetch = FetchType.LAZY)
	private List<Employee> employees = new ArrayList<>();

	@OneToMany(mappedBy = "jobFamily", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<JobFamilyTitle> jobFamilyTitle;

}
