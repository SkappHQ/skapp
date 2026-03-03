package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "es_recipient_eid_config")
public class RecipientEidConfig extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "recipient_id", nullable = false, unique = true)
	private Recipient recipient;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_verification_method", nullable = false)
	@Builder.Default
	private EidProviderType eidVerificationMethod = EidProviderType.NONE;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_verification_status", nullable = false)
	@Builder.Default
	private EidVerificationStatus eidVerificationStatus = EidVerificationStatus.NOT_REQUIRED;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_identification_method")
	@Builder.Default
	private EidProviderType eidIdentificationMethod = EidProviderType.NONE;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_identification_status")
	@Builder.Default
	private EidVerificationStatus eidIdentificationStatus = EidVerificationStatus.NOT_REQUIRED;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "verified_identity_id")
	private VerifiedIdentity verifiedIdentity;

	public boolean requiresVerification() {
		return eidVerificationMethod != null && eidVerificationMethod.requiresVerification();
	}

	public boolean isVerificationComplete() {
		return !requiresVerification() || eidVerificationStatus == EidVerificationStatus.VERIFIED;
	}

	public boolean requiresIdentification() {
		return eidIdentificationMethod != null && eidIdentificationMethod.requiresVerification();
	}

	public boolean isIdentificationComplete() {
		return !requiresIdentification() || eidIdentificationStatus == EidVerificationStatus.VERIFIED;
	}

}
