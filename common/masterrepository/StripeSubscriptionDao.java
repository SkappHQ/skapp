package com.skapp.enterprise.common.masterrepository;

import com.skapp.enterprise.common.model.master.StripeSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StripeSubscriptionDao extends JpaRepository<StripeSubscription, String> {

	StripeSubscription findBySubscriptionId(String id);

	StripeSubscription findByCustomerId(String customerId);

}
