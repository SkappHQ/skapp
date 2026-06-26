package com.skapp.community.common.repository;

import com.skapp.community.common.model.SystemVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemVersionDao extends JpaRepository<SystemVersion, String> {

	SystemVersion findFirstByOrderByCreatedDateDesc();

}
