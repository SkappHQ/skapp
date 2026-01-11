package com.skapp.enterprise.esignature.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.esignature.type.SignType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "es_template_envelope")
public class TemplateEnvelope extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "name")
	private String name;

	@Column(name = "subject")
	private String subject;

	@Column(name = "message")
	private String message;

	@Enumerated(EnumType.STRING)
	@Column(name = "sign_type")
	private SignType signType;

	@OneToOne
	@JoinColumn(name = "owner_id")
	private AddressBook owner;

	@OneToMany(mappedBy = "templateEnvelope", cascade = CascadeType.ALL)
	private List<TemplateDocument> templateDocuments;

	@OneToMany(mappedBy = "templateEnvelope", cascade = CascadeType.ALL)
	private List<TemplateRecipient> templateRecipients;

	@OneToOne(mappedBy = "templateEnvelope", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private TemplateEnvelopeSetting templateEnvelopeSetting;

}
