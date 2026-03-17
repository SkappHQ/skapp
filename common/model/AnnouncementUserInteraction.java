package com.skapp.enterprise.common.model;

import com.skapp.enterprise.common.type.AnnouncementInteractionType;
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

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "announcement_user_interaction")
public class AnnouncementUserInteraction extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false, updatable = false)
	private Long id;

	@Column(name = "announcement_id", nullable = false)
	private Long announcementId;

	@Column(name = "employee_id", nullable = false)
	private Long employeeId;

	@Enumerated(EnumType.STRING)
	@Column(name = "interaction_type", nullable = false, length = 30)
	private AnnouncementInteractionType interactionType;

	@Column(name = "last_seen_at")
	private LocalDateTime lastSeenAt;

}
