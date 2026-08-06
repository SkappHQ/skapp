package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A file attached to a {@link PolicyLeaveRequest}.
 *
 * <p>
 * {@code fileUrl} is the storage handle the upload returned, not a browsable URL: a bare
 * UUID filename on community (the file lives encrypted under the leave-attachments
 * directory) and an S3 key on enterprise. {@code originalFileName} is kept alongside it
 * so the UI can show the name the employee actually uploaded — the legacy
 * {@code leave_request_attachment} declares that column but never populates it, which is
 * why community users see a UUID when they download.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lv_leave_request_attachment")
public class PolicyLeaveRequestAttachment extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "leave_request_id", nullable = false)
	private PolicyLeaveRequest leaveRequest;

	@Column(name = "file_url", nullable = false)
	private String fileUrl;

	@Column(name = "original_file_name")
	private String originalFileName;

	public PolicyLeaveRequestAttachment(PolicyLeaveRequest leaveRequest, String fileUrl, String originalFileName) {
		this.leaveRequest = leaveRequest;
		this.fileUrl = fileUrl;
		this.originalFileName = originalFileName;
	}

}
