package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.MemberRole;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GenerationType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_template_recipient")
public class TemplateRecipient extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "recipient_role")
	private String recipientRole;

	@Enumerated(EnumType.STRING)
	@Column(name = "member_role")
	private MemberRole memberRole;

	@Column(name = "signing_order")
	private int signingOrder;

	@Column(name = "color")
	private String color;

	@Column(name = "mfa_verification_enabled", nullable = false)
	private boolean mfaVerificationEnabled;

	// @Enumerated(EnumType.STRING)
	// @Column(name = "mfa_verification_method")
	// private EsignVerificationType mfaVerificationMethod;

	@ManyToOne
	@JoinColumn(name = "template_envelope_id")
	private TemplateEnvelope templateEnvelope;

	@OneToMany(mappedBy = "templateRecipient", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<TemplateField> templateFields;

	@ManyToOne(optional = true)
	@JoinColumn(name = "address_book_id", nullable = true)
	private AddressBook addressBook;

}
