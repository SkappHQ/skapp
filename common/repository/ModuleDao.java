package com.skapp.enterprise.common.repository;

import com.skapp.community.common.type.ModuleType;
import com.skapp.enterprise.common.model.ModuleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuleDao extends JpaRepository<ModuleConfig, ModuleType> {

	Optional<ModuleConfig> findFirstBy();

}
