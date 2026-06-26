package com.skapp.community.peopleplanner.model;

import com.skapp.community.common.type.ModuleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "module_role_restriction")
public class ModuleRoleRestriction {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "module", columnDefinition = "varchar(255)")
	private ModuleType module;

	@Column(name = "is_admin")
	private Boolean isAdmin;

	@Column(name = "is_manager")
	private Boolean isManager;

}
