package com.skapp.enterprise.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "module_config")
public class ModuleConfig {

	@Id
	@Column(name = "id")
	private Long id;

	@Column(name = "leave_module")
	private boolean leaveModule;

	@Column(name = "attendance_module")
	private boolean attendanceModule;

	@Column(name = "esign_module")
	private boolean esignModule;

	@Column(name = "invoice_module")
	private boolean invoiceModule;

	@Column(name = "pm_module")
	private boolean pmModule;

}
