package com.skapp.enterprise.common.model.master;

import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "tenant")
public class Tenant {

	@Id
	@Column(name = "tenant_name")
	private String tenantName;

	@Column(name = "is_active")
	private boolean isActive;

	@Enumerated(EnumType.STRING)
	@Column(name = "tenant_status", columnDefinition = "varchar(255)")
	private TenantStatus tenantStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "tenant_login_method", columnDefinition = "varchar(255)")
	private LoginMethod loginMethod;

	@Enumerated(EnumType.STRING)
	@Column(name = "tier", columnDefinition = "varchar(255)")
	private Tier tier;

	@Column(name = "billing_email")
	private String billingEmail;

	@Enumerated(EnumType.STRING)
	@Column(name = "subscription_status", columnDefinition = "varchar(255)")
	private SubscriptionStatus subscriptionStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "subscription_plan", columnDefinition = "varchar(255)")
	private SubscriptionPlan subscriptionPlan;

	@Column(name = "created_by_email")
	private String createdByEmail;

	@CreationTimestamp
	@Column(name = "created_date")
	private Instant createdDate;

	@Column(name = "last_modified_by_email")
	private String lastModifiedByEmail;

	@Column(name = "last_modified_date")
	private Instant lastModifiedDate;

	@OneToOne(mappedBy = "tenant", cascade = CascadeType.ALL)
	private StripeSubscription stripeSubscription;

}
