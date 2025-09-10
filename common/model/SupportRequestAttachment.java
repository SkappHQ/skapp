package com.skapp.enterprise.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "support_request_attachment")
public class SupportRequestAttachment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "attachment_id", updatable = false)
	private Long attachmentId;

	@Column(name = "file_path", updatable = false)
	private String filePath;

	@ManyToOne(optional = false)
	@JoinColumn(name = "support_request_id")
	private SupportRequest supportRequest;

	public SupportRequestAttachment(String filePath, SupportRequest supportRequest) {
		this.filePath = filePath;
		this.supportRequest = supportRequest;
	}

}
