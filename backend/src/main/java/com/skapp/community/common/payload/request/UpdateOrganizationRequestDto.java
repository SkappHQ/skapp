package com.skapp.community.common.payload.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import static com.skapp.community.common.constant.ValidationConstant.HEXA_DECIMAL_VALIDATION_PATTERN;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateOrganizationRequestDto {

	@Schema(description = "The name of the organization. Cannot be null.", example = "Skapp")
	private String organizationName;

	@Schema(description = "The website of the organization. Must be a valid URL with a length between 1 and 2083 characters.",
			example = "https://www.example.com")
	private String organizationWebsite;

	@Schema(description = "The country where the organization is located. Cannot be null.", example = "Sri Lanka")
	private String country;

	@Schema(description = "The logo of the organization. Must be a valid file name with a length between 1 and 100 characters.",
			example = "logo.png")
	private String organizationLogo;

	@Schema(description = "The theme color in hexadecimal format (e.g., #FFFFFF). Must match the regex pattern for a valid hexadecimal color.",
			example = "#FFFFFF", pattern = HEXA_DECIMAL_VALIDATION_PATTERN)
	private String themeColor;

}
