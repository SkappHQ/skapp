package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AmazonS3DeleteItemRequestDto {

	@NotNull
	private String folderPath;

}
