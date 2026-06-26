package com.skapp.community.leaveplanner.model;

import com.skapp.community.leaveplanner.type.CalculationType;
import com.skapp.community.leaveplanner.type.LeaveDuration;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "leave_type")
public class LeaveType {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "type_id")
	private Long typeId;

	@Column(name = "name", nullable = false, length = 20, unique = true)
	private String name;

	@Column(name = "emoji_code")
	private String emojiCode;

	@Column(name = "color_code")
	private String colorCode;

	@Enumerated(EnumType.STRING)
	@Column(name = "calculation_type", nullable = false, columnDefinition = "varchar(255)")
	private CalculationType calculationType;

	@Enumerated(EnumType.STRING)
	@Column(name = "min_duration", nullable = false, columnDefinition = "varchar(255)")
	private LeaveDuration leaveDuration;

	@Column(name = "max_carry_forward_days")
	private float maxCarryForwardDays;

	@Column(name = "carry_forward_expiration_days")
	private float carryForwardExpirationDays;

	@Column(name = "carry_forward_expiration_date")
	private LocalDate carryForwardExpirationDate;

	@Column(name = "is_attachment")
	private Boolean isAttachment = Boolean.FALSE;

	@Column(name = "is_overridden")
	private Boolean isOverridden = Boolean.FALSE;

	@Column(name = "is_attachment_must")
	private Boolean isAttachmentMandatory = Boolean.FALSE;

	@Column(name = "is_comment_must")
	private Boolean isCommentMandatory = Boolean.FALSE;

	@Column(name = "is_auto_approval")
	private Boolean isAutoApproval = Boolean.FALSE;

	@Column(name = "is_active")
	private Boolean isActive = Boolean.TRUE;

	@Column(name = "carry_forward_enabled")
	private Boolean isCarryForwardEnabled = Boolean.FALSE;

	@Column(name = "is_carry_forward_remaining_balance_enabled")
	private Boolean isCarryForwardRemainingBalanceEnabled = Boolean.FALSE;

	@OneToMany(mappedBy = "leaveType")
	private List<LeaveEntitlement> leaveEntitlements = new ArrayList<>();

	@OneToMany(mappedBy = "leaveType", fetch = FetchType.LAZY)
	private List<LeaveRequest> leaveRequests = new ArrayList<>();

	@OneToMany(mappedBy = "leaveType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<CarryForwardInfo> carryForwardInfos;

}
