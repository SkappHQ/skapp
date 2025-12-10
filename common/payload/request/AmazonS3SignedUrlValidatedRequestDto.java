package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AmazonS3ActionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AmazonS3SignedUrlValidatedRequestDto {

	@NotNull
	private String folderPath;

	private String fileType;

	private Long fileSize;

	@NotNull
	private AmazonS3ActionType action;

}
