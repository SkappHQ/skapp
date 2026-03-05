package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.StripeSubscriptionHistory;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StripeSubscriptionHistoryDao extends JpaRepository<StripeSubscriptionHistory, Long> {

	List<StripeSubscriptionHistory> findByTenantName(String tenantName);

	List<StripeSubscriptionHistory> findBySubscriptionId(String subscriptionId);

	List<StripeSubscriptionHistory> findByCustomerId(String customerId);

	Optional<StripeSubscriptionHistory> findTopByTenantNameOrderByCreatedDateDesc(String tenantName);

	boolean existsByTenantNameAndSubscriptionStatusAndTier(String tenantName, SubscriptionStatus subscriptionStatus,
			Tier tier);

}
