package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.StripeSubscriptionHistory;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StripeSubscriptionHistoryDao extends JpaRepository<StripeSubscriptionHistory, Long> {

	boolean existsByTenantNameAndSubscriptionStatusAndTier(String tenantName, SubscriptionStatus subscriptionStatus,
			Tier tier);

	List<StripeSubscriptionHistory> findByTenantNameAndSubscriptionStatusAndTierIn(String tenantName,
			SubscriptionStatus subscriptionStatus, List<Tier> tiers);

}
