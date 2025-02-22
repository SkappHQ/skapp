package com.skapp.enterprise.common.model.master;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "stripe_subscription")
public class StripeSubscription {

	@Id
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

	@Column(name = "created_date")
	private Instant createdDate;

	@Column(name = "last_modified_by_email")
	private String lastModifiedByEmail;

	@Column(name = "last_modified_date")
	private Instant lastModifiedDate;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tenant_name", referencedColumnName = "tenant_name")
	private Tenant tenant;

}
