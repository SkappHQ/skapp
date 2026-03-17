package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import com.skapp.enterprise.common.type.AnnouncementTargetPage;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FeatureAnnouncementCreateRequestDto {

	@NotBlank
	@Size(max = 100)
	private String title;

	@NotBlank
	private String description;

	@Size(max = 50)
	private String ctaLabel;

	private String ctaLink;

	@NotNull
	private AnnouncementTargetPage targetPage;

	@NotNull
	private AnnouncementTriggerType triggerType;

	@NotNull
	private AnnouncementFrequencyType frequencyType;

	private Integer customFrequencyDays;

	private AnnouncementStatus status;

	@NotEmpty
	private List<Role> recipientRoles;

	@NotBlank
	private String imagePath;

}
