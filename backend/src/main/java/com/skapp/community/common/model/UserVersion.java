package com.skapp.community.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user_version")
public class UserVersion extends Auditable<String> {

	@Id
	@Column(name = "user_id")
	private Long userId;

	@Column(name = "version")
	private String version;

}
