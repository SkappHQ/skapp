package com.skapp.community.leaveplanner.model;

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

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "leave_request_entitlement")
public class LeaveRequestEntitlement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "leave_request_id")
	private LeaveRequest leaveRequest;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "leave_entitlement_id")
	private LeaveEntitlement leaveEntitlement;

	@Column(name = "days_used")
	private float daysUsed;

}
