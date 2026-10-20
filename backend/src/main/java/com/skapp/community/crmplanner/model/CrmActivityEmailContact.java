package com.skapp.community.crmplanner.model;

import com.skapp.community.crmplanner.type.CrmActivityEmailContactRole;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_activity_email_contact")
public class CrmActivityEmailContact {

	@EmbeddedId
	private CrmActivityEmailContactId id;

	@MapsId("emailId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "email_id", nullable = false)
	private CrmActivityEmail email;

	@MapsId("contactId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "contact_id", nullable = false)
	private CrmContact contact;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	private CrmActivityEmailContactRole role;

	public CrmActivityEmailContact(CrmActivityEmail email, CrmContact contact, CrmActivityEmailContactRole role) {
		this.id = new CrmActivityEmailContactId(email.getId(), contact.getId());
		this.email = email;
		this.contact = contact;
		this.role = role;
	}

}
