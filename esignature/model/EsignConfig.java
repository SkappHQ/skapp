package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.DateFormatType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "es_config")
public class EsignConfig {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "date_format")
	private DateFormatType dateFormat;

	@Column(name = "expiration_days")
	private int defaultEnvelopeExpireDays;

	@Column(name = "reminder_days")
	private int reminderDaysBeforeExpire;

	@Column(name = "is_mfa_enabled")
	private Boolean isMfaEnabled;

}
