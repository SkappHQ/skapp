package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.AuditAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "es_audit_trail")
public class AuditTrail {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "audit_id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "envelope_id", nullable = false)
	private Envelope envelope;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id")
	private Recipient recipient;

	@Column(name = "ip_address", nullable = false, updatable = false)
	private String ipAddress;

	@Enumerated(EnumType.STRING)
	@Column(name = "action", nullable = false, updatable = false)
	private AuditAction action;

	@Column(name = "timestamp", nullable = false, updatable = false)
	private Instant timestamp;

	@Column(name = "metadata", nullable = false, updatable = false)
	private String metadata;

	@Column(name = "hash", nullable = false, updatable = false)
	private String hash;

}
