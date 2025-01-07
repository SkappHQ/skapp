package com.skapp.enterprise.esignature.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "es_envelope_setting")
public class EnvelopeSetting {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "expiration_date")
	private LocalDateTime expirationDate;

	@Column(name = "reminder_days")
	private Integer reminderDays;

	@Column(name = "retention_period")
	private Integer retentionPeriod;

	@Column(name = "auto_delete_after_retention")
	private Boolean autoDeleteAfterRetention;

	@Column(name = "allow_signing_order_change")
	private Boolean allowSigningOrderChange;

	@Column(name = "allow_editing_fields")
	private Boolean allowEditingFields;

	@Column(name = "brand_logo_url")
	private String brandLogoUrl;

	@Column(name = "brand_theme")
	private String brandTheme;

	@Column(name = "digital_signature_required")
	private Boolean digitalSignatureRequired;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "envelope_id")
	private Envelope envelope;

}
