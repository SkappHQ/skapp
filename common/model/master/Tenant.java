package com.skapp.enterprise.common.model.master;

import com.skapp.community.common.type.LoginMethod;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tenant")
public class Tenant {

	@Id
	@Column(name = "tenant_name")
	private String tenantName;

	@Column(name = "is_active")
	private boolean isActive;

	@CreationTimestamp
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "created_at", updatable = false)
	private Instant createdAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "tenant_login_method", columnDefinition = "varchar(255)")
	private LoginMethod loginMethod;

}
