package com.skapp.community.okrplanner.repository;

import com.skapp.community.okrplanner.model.TeamObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamObjectiveRepository extends JpaRepository<TeamObjective, Long> {

	@Query("SELECT obj FROM TeamObjectiveAssignedTeam toa JOIN toa.teamObjective obj JOIN toa.team t WHERE t.teamId = :teamId AND obj.effectiveTimePeriod = :effectiveTimePeriod")
	List<TeamObjective> findByTeamIdAndEffectiveTimePeriod(@Param("teamId") Long teamId,
			@Param("effectiveTimePeriod") Long effectiveTimePeriod);

}
