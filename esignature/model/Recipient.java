package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.EidProviderType;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import com.skapp.enterprise.esignature.type.EsignVerificationType;
import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.InboxStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "es_recipient")
public class Recipient {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "recipient_id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "email")
	private String email;

	@Enumerated(EnumType.STRING)
	@Column(name = "member_role")
	private MemberRole memberRole;

	@Enumerated(EnumType.STRING)
	private RecipientStatus status;

	@Column(name = "signing_order")
	private int signingOrder;

	@Column(name = "color")
	private String color;

	@ManyToOne
	@JoinColumn(name = "envelope_id")
	private Envelope envelope;

	@OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Field> fields;

	@ManyToOne
	@JoinColumn(name = "address_book_id")
	private AddressBook addressBook;

	@Column(name = "reminder_batch_id")
	private String reminderBatchId;

	@Enumerated(EnumType.STRING)
	@Column(name = "reminder_status")
	private EmailReminderStatus reminderStatus;

	@Enumerated(EnumType.STRING)
	@Column(name = "email_status")
	private EmailStatus emailStatus;

	@Column(name = "received_at")
	private LocalDateTime receivedAt;

	@Column(name = "decline_reason")
	private String declineReason;

	@Column(name = "is_consent", nullable = false)
	private boolean isConsent;

	@Enumerated(EnumType.STRING)
	@Column(name = "inbox_status")
	private InboxStatus inboxStatus;

	@Column(name = "mfa_verification_enabled", nullable = false)
	private boolean mfaVerificationEnabled;

	@Enumerated(EnumType.STRING)
	@Column(name = "mfa_verification_method")
	private EsignVerificationType mfaVerificationMethod;

	@OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<EsignVerificationSession> verificationSessions;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_verification_method")
	private EidProviderType eidVerificationMethod = EidProviderType.NONE;

	@Enumerated(EnumType.STRING)
	@Column(name = "eid_verification_status")
	private EidVerificationStatus eidVerificationStatus = EidVerificationStatus.NOT_REQUIRED;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "verified_identity_id")
	private VerifiedIdentity verifiedIdentity;

	/**
	 * Check if this recipient requires eID verification before signing.
	 * @return true if eID verification is required
	 */
	public boolean requiresEidVerification() {
		return eidVerificationMethod != null && eidVerificationMethod.requiresVerification();
	}

	/**
	 * Check if eID verification has been completed for this recipient.
	 * @return true if verification is complete or not required
	 */
	public boolean isEidVerificationComplete() {
		return !requiresEidVerification() || eidVerificationStatus == EidVerificationStatus.VERIFIED;
	}

}
