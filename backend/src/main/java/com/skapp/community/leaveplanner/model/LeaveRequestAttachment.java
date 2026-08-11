package com.skapp.community.leaveplanner.model;

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
@Table(name = "leave_request_attachment")
public class LeaveRequestAttachment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "attachment_id", updatable = false)
	private Long attachmentId;

	@Column(name = "cognito_file_name", updatable = false)
	private String cognitoFileName;

	@Column(name = "original_file_name", updatable = false)
	private String originalFileName;

	@Column(name = "file_Url", updatable = false)
	private String url;

	@ManyToOne(optional = false)
	@JoinColumn(name = "leave_Request_id")
	private LeaveRequest leaveRequest;

	public LeaveRequestAttachment(String url, LeaveRequest leaveRequest) {
		this.url = url;
		this.leaveRequest = leaveRequest;
	}

}
