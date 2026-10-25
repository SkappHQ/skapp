package com.skapp.community.crmplanner.model;

import com.skapp.community.crmplanner.type.CrmActivityType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CrmActivityFeedItemId implements Serializable {

	@Enumerated(EnumType.STRING)
	@Column(name = "activity_type")
	private CrmActivityType activityType;

	@Column(name = "activity_id")
	private Long activityId;

}
