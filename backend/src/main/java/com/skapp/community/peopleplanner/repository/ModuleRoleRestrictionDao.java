package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.peopleplanner.model.ModuleRoleRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Dead: module_role_restriction is neither read nor written since role restrictions moved
// to module_roles_restriction. Kept only so the enterprise subclass constructor keeps
// compiling, and deleted together with the table. Not annotated @Deprecated because the
// enterprise constructor referencing it lives in a submodule that cannot suppress it.
@Repository
public interface ModuleRoleRestrictionDao extends JpaRepository<ModuleRoleRestriction, ModuleType> {

}
