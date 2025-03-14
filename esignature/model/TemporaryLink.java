package com.skapp.enterprise.esignature.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "temporary_links")
public class TemporaryLink {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String token;

	@Column(nullable = false)
	private String tenantId;

	@Column(nullable = false)
	private Long documentId;

	@Column(nullable = false)
	private Long createdByUserId;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	@Column(nullable = false)
	private Integer maxClicks;

	@Column(nullable = false)
	private Integer clickCount;

	@Column(nullable = false)
	private boolean active;

	@PrePersist
	protected void onCreate() {
		if (this.token == null) {
			this.token = UUID.randomUUID().toString();
		}
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
		if (this.expiresAt == null) {
			this.expiresAt = LocalDateTime.now().plusHours(48);
		}
		if (this.maxClicks == null) {
			this.maxClicks = 5;
		}
		if (this.clickCount == null) {
			this.clickCount = 0;
		}
		if (!this.active) {
			this.active = true;
		}
	}

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt) || clickCount >= maxClicks || !active;
	}

	public void incrementClickCount() {
		this.clickCount++;
		if (this.clickCount >= this.maxClicks) {
			this.active = false;
		}
	}

}