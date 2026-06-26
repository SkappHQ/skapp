package com.skapp.community.peopleplanner.model;

import jakarta.persistence.CascadeType;
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

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "team")
public class Team {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "team_id", nullable = false, updatable = false)
	private Long teamId;

	@Column(name = "team_name", length = 50)
	private String teamName;

	@Column(name = "is_active")
	private boolean isActive = true;

	@OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
	private List<EmployeeTeam> employees;

}
