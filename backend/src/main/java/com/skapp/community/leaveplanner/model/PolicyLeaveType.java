package com.skapp.community.leaveplanner.model;

import com.skapp.community.common.model.Auditable;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lv_leave_type")
public class PolicyLeaveType extends Auditable<String> {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "emoji_code")
	private String emojiCode;

	@Column(name = "color_code")
	private String colorCode;

	@Enumerated(EnumType.STRING)
	@Column(name = "min_duration", nullable = false)
	private LeaveDuration minDuration;

	@Column(name = "is_attachment", nullable = false)
	private Boolean isAttachment = Boolean.FALSE;

	@Column(name = "is_attachment_must", nullable = false)
	private Boolean isAttachmentMust = Boolean.FALSE;

	@Column(name = "is_comment_must", nullable = false)
	private Boolean isCommentMust = Boolean.FALSE;

	@Column(name = "is_auto_approval", nullable = false)
	private Boolean isAutoApproval = Boolean.FALSE;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive = Boolean.TRUE;

	@OneToMany(mappedBy = "leaveType")
	private List<LeavePolicy> leavePolicies;

}
