package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.SignType;
import com.skapp.enterprise.esignature.type.EnvelopeStatus;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "es_envelope")
public class Envelope extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "envelope_id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Enumerated(EnumType.STRING)
	private EnvelopeStatus status;

	@Column(name = "message")
	private String message;

	@Column(name = "subject")
	private String subject;

	@Column(name = "sent_at")
	private LocalDateTime sentAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@Column(name = "declined_at")
	private LocalDateTime declinedAt;

	@Column(name = "expire_at")
	private LocalDateTime expireAt;

	@OneToOne
	@JoinColumn(name = "owner_id")
	private AddressBook owner;

	@OneToMany(mappedBy = "envelope", cascade = CascadeType.ALL)
	private List<Document> documents;

	@OneToMany(mappedBy = "envelope", cascade = CascadeType.ALL)
	private List<Recipient> recipients;

	@OneToOne(mappedBy = "envelope", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private EnvelopeSetting setting;

	@Column(name = "void_reason")
	private String voidReason;

	@Enumerated(EnumType.STRING)
	@Column(name = "sign_type", columnDefinition = "varchar(255)")
	private SignType signType;

	@Column(name = "envelope_uuid", nullable = false, unique = true, length = 23)
	private String uuid;

}
