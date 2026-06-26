package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TeamDao extends JpaRepository<Team, Long>, TeamRepository {

	Optional<Team> findByTeamNameAndIsActiveTrue(String teamName);

	List<Team> findByIsActive(boolean b);

	Optional<Team> findByTeamIdAndIsActive(Long id, boolean isActive);

	List<Team> findByTeamNameInAndIsActiveTrue(List<String> teamNames);

	List<Team> findAllByTeamNameIn(Set<String> teamName);

	Boolean existsAllByTeamIdIn(List<Long> teamIds);

	List<Team> findByTeamIdIn(List<Long> teamIds);

	boolean existsByTeamIdAndIsActive(Long teamId, boolean b);

	List<Team> findAllByIsActive(boolean isActive);

	Team findByTeamId(Long teamId);

}
