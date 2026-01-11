package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "es_template_envelope_setting")
public class TemplateEnvelopeSetting extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "reminder_days")
	private Integer reminderDays;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "template_envelope_id")
	private TemplateEnvelope templateEnvelope;

}
