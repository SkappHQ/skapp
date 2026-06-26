package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.GoogleWorkspaceConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoogleWorkspaceConnectionDao extends JpaRepository<GoogleWorkspaceConnection, Long> {

    Optional<GoogleWorkspaceConnection> findFirstByActiveTrue();

}