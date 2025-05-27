package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AmazonS3ActionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AmazonS3SignedUrlRequestDto {

	@NotNull
	private String folderPath;

	private String fileType;

	@NotNull
	private AmazonS3ActionType action;

}
