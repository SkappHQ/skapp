package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.EmailReminderStatus;
import com.skapp.enterprise.esignature.type.EmailStatus;
import com.skapp.enterprise.esignature.type.MemberRole;
import com.skapp.enterprise.esignature.type.RecipientStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

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

}
