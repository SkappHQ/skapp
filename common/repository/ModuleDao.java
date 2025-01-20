package com.skapp.enterprise.common.repository;

import com.skapp.community.common.type.ModuleType;
import com.skapp.enterprise.common.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleDao extends JpaRepository<Module, ModuleType> {

}
