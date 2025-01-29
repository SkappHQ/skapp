package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExternalUserDao extends JpaRepository<ExternalUser, Long>, ExternalUserRepository {

}
