package com.skapp.community.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "organization")
public class Organization {

	@Id
	@Column(name = "organization_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long organizationId;

	@Column(name = "organization_name", length = 100, unique = true)
	private String organizationName;

	@Column(name = "organization_website", length = 2083)
	private String organizationWebsite;

	@Column(name = "country", length = 100)
	private String country;

	@Column(name = "organization_time_zone", length = 100)
	private String organizationTimeZone;

	@Column(name = "organization_logo", length = 100)
	private String organizationLogo;

	@Column(name = "theme_color", length = 9)
	private String themeColor;

	@Column(name = "app_url")
	private String appUrl;

}
