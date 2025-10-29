package com.skapp.community.okrplanner.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "team_objective")
@Getter
@Setter
public class TeamObjective {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "title")
	private String title;

	@Column(name = "effective_time_period")
	private Long effectiveTimePeriod;

	@Column(name = "duration")
	private String duration;

	@OneToMany(mappedBy = "teamObjective", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<TeamObjectiveAssignedTeam> assignedTeams;

	@OneToMany(mappedBy = "teamObjective", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<KeyResults> keyResults;

	// TODO: OneTOOne relationship with CompanyObjective when it is created

}
