package com.skapp.enterprise.common.model;

import com.skapp.community.common.type.ModuleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "module")
public class Module {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "module_name", columnDefinition = "varchar(255)")
	private ModuleType moduleName;

}
