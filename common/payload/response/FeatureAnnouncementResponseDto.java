package com.skapp.enterprise.common.payload.response;

import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import com.skapp.enterprise.common.type.AnnouncementTargetPage;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class FeatureAnnouncementResponseDto {

	private Long announcementId;

	private String title;

	private String description;

	private String ctaLabel;

	private String ctaLink;

	private AnnouncementTargetPage targetPage;

	private AnnouncementTriggerType triggerType;

	private AnnouncementFrequencyType frequencyType;

	private Integer customFrequencyDays;

	private AnnouncementStatus status;

	private String imagePath;

	private LocalDateTime createdDate;

	private List<Role> recipientRoles;

}
