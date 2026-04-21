package com.skapp.community.crmplanner.model;

import com.skapp.community.common.model.User;
import com.skapp.community.crmplanner.type.CrmRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "crm_user_role")
public class CrmUserRole {

	@Id
	@Column(name = "user_id", nullable = false, updatable = false)
	private Long userId;

	@OneToOne(fetch = FetchType.LAZY)
	@MapsId
	@JoinColumn(name = "user_id")
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "crm_role", length = 50)
	private CrmRole crmRole = CrmRole.SALES_REP;

	@Column(name = "created_by")
	private String createdBy;

	@Column(name = "created_date")
	private LocalDateTime createdDate;

}
