package com.skapp.enterprise.esignature.model;

import com.skapp.enterprise.esignature.type.DocumentPermissionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
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
@Table(name = "es_document_link")
public class DocumentLink {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String token;

	@Column(name = "expires_at", nullable = false)
	private LocalDateTime expiresAt;

	@Column(name = "max_clicks", nullable = false)
	private Integer maxClicks;

	@Column(name = "click_count", nullable = false)
	private Integer clickCount;

	@Column(name = "is_active", nullable = false)
	private boolean isActive;

	@Column(name = "create_by_user_id", nullable = false)
	private Long createdByUserId;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@ManyToOne
	@JoinColumn(name = "envelope_id")
	private Envelope envelopeId;

	@ManyToOne
	@JoinColumn(name = "recipient_id")
	private Recipient recipientId;

	@ManyToOne
	@JoinColumn(name = "document_id")
	private Document documentId;

	@Column(name = "is_resend", nullable = false)
	private boolean isResend;

	@Enumerated(EnumType.STRING)
	@Column(name = "permission_type")
	private DocumentPermissionType permissionType;

	@Column(name = "uuid", nullable = false)
	private String uuid;

	@PrePersist
	protected void onCreate() {
		if (this.token == null) {
			this.token = UUID.randomUUID().toString();
		}
		if (this.clickCount == null) {
			this.clickCount = 0;
		}
		if (!this.isActive) {
			this.isActive = true;
		}
		if (this.isResend) {
			this.isResend = false;
		}
	}

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt) || clickCount > maxClicks || !isActive;
	}

	public void incrementClickCount() {
		this.clickCount++;
		if (this.clickCount > this.maxClicks) {
			this.isActive = false;
		}
	}

}
