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
@Table(name = "module_roles_restriction")
public class ModuleRolesRestriction {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "module", columnDefinition = "varchar(255)")
	private ModuleType module;

	@Column(name = "restrictions", columnDefinition = "varchar(255)")
	private String restrictions;

}
