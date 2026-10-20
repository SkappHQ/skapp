package com.skapp.community.crmplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CrmActivityEmailContactId implements Serializable {

	@Column(name = "email_id", nullable = false)
	private Long emailId;

	@Column(name = "contact_id", nullable = false)
	private Long contactId;

}
