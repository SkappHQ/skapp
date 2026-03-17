package com.skapp.enterprise.common.model.master;

import com.skapp.community.common.model.Auditable;
import com.skapp.enterprise.common.type.AnnouncementFrequencyType;
import com.skapp.enterprise.common.type.AnnouncementStatus;
import com.skapp.enterprise.common.type.AnnouncementTargetPage;
import com.skapp.enterprise.common.type.AnnouncementTriggerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "feature_announcement")
@Getter
@Setter
@NoArgsConstructor
public class FeatureAnnouncement extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "announcement_id", nullable = false, updatable = false)
	private Long announcementId;

	@Column(name = "title", length = 100, nullable = false)
	private String title;

	@Column(name = "description", columnDefinition = "TEXT", nullable = false)
	private String description;

	@Column(name = "cta_label", length = 50)
	private String ctaLabel;

	@Column(name = "cta_link", columnDefinition = "TEXT")
	private String ctaLink;

	@Enumerated(EnumType.STRING)
	@Column(name = "target_page", nullable = false)
	private AnnouncementTargetPage targetPage;

	@Enumerated(EnumType.STRING)
	@Column(name = "trigger_type", nullable = false)
	private AnnouncementTriggerType triggerType;

	@Enumerated(EnumType.STRING)
	@Column(name = "frequency_type", nullable = false)
	private AnnouncementFrequencyType frequencyType;

	@Column(name = "custom_frequency_days")
	private Integer customFrequencyDays;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private AnnouncementStatus status;

	@Column(name = "image_path", columnDefinition = "TEXT")
	private String imagePath;

}
