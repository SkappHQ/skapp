package com.skapp.community.common.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import static com.skapp.community.common.constant.ValidationConstant.HEXA_DECIMAL_VALIDATION_PATTERN;

@Getter
@Setter
public class OrganizationDto {

	@NotNull
	@Schema(description = "The name of the organization. Cannot be null.", example = "Skapp")
	private String organizationName;

	@Schema(description = "The website of the organization. Must be a valid URL with a length between 1 and 2083 characters.",
			example = "https://www.example.com")
	@Size(max = 2083)
	private String organizationWebsite;

	@NotNull
	@Schema(description = "The country where the organization is located. Cannot be null.", example = "Sri Lanka")
	private String country;

	private String organizationTimeZone;

	@Schema(description = "The logo of the organization. Must be a valid file name with a length between 1 and 100 characters.",
			example = "logo.png")
	@Size(max = 100)
	private String organizationLogo;

	@Schema(description = "The theme color in hexadecimal format (e.g., #FFFFFF). Must match the regex pattern for a valid hexadecimal color.",
			example = "#FFFFFF", pattern = HEXA_DECIMAL_VALIDATION_PATTERN)
	@Size(min = 1, max = 9)
	private String themeColor;

	@Schema(description = "The URL of the application. Must be a valid URL.", example = "https://www.example.com")
	private String appUrl;

}
