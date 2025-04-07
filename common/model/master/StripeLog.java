package com.skapp.enterprise.common.model.master;

import com.skapp.enterprise.common.type.StripeLogStatus;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "stripe_log")
public class StripeLog {

	@Id
	@GeneratedValue
	@UuidGenerator
	@Column(name = "log_id")
	private String logId;

	@Column(name = "tenant_name")
	private String tenantName;

	@Column(name = "customer_name")
	private String customerName;

	@Column(name = "customer_id")
	private String customerId;

	@Column(name = "created_date")
	private Instant createdDate;

	@Enumerated(EnumType.STRING)
	@Column(name = "event_type", columnDefinition = "varchar(255)")
	private StripeWebhookEventTypes eventType;

	@Column(name = "stripe_event_id")
	private String stripeEventId;

	@Column(name = "status")
	@Enumerated(EnumType.STRING)
	private StripeLogStatus status;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Column(name = "response_payload", columnDefinition = "TEXT")
	private String responsePayload;

}
