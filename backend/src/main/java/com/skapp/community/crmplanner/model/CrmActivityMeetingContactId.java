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
public class CrmActivityMeetingContactId implements Serializable {

	@Column(name = "meeting_id", nullable = false)
	private Long meetingId;

	@Column(name = "contact_id", nullable = false)
	private Long contactId;

}
