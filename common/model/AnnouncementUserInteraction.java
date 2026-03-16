package com.skapp.enterprise.common.model;

import com.skapp.enterprise.common.model.master.FeatureAnnouncement;
import com.skapp.enterprise.common.type.AnnouncementInteractionType;
import com.skapp.community.peopleplanner.model.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "announcement_user_interaction",
		uniqueConstraints = @UniqueConstraint(name = "uk_ann_emp", columnNames = { "announcement_id", "employee_id" }))
public class AnnouncementUserInteraction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "announcement_id", nullable = false)
	private FeatureAnnouncement announcement;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "employee_id", nullable = false)
	private Employee employee;

	@Enumerated(EnumType.STRING)
	@Column(name = "interaction_type", nullable = false, length = 30)
	private AnnouncementInteractionType interactionType;

	@Column(name = "last_seen_at")
	private LocalDateTime lastSeenAt;

}
