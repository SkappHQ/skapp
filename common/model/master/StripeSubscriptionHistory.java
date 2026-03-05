package com.skapp.enterprise.common.model.master;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "stripe_subscription_history")
public class StripeSubscriptionHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "tenant_name")
	private String tenantName;

	@Column(name = "subscription_id")
	private String subscriptionId;

	@Column(name = "customer_id")
	private String customerId;

	@Column(name = "subscription_start_date")
	private Instant subscriptionStartDate;

	@Column(name = "created_by_email")
	private String createdByEmail;

	@Column(name = "last_modified_date")
	private Instant lastModifiedDate;

	@CreationTimestamp
	@Column(name = "created_date", updatable = false)
	private Instant createdDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "tier", columnDefinition = "varchar(255)")
	private Tier tier;

	@Enumerated(EnumType.STRING)
	@Column(name = "subscription_status", columnDefinition = "varchar(255)")
	private SubscriptionStatus subscriptionStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "subscription_plan", columnDefinition = "varchar(255)")
	private SubscriptionPlan subscriptionPlan;

}
