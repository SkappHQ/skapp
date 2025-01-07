package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantDao extends JpaRepository<Tenant, String> {

	Tenant findByTenantName(String companyDomain);

}
