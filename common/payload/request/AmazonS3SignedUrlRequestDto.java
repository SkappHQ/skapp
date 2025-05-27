package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AmazonS3ActionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AmazonS3SignedUrlRequestDto {

	private String folderPath;

	private AmazonS3ActionType action;

}
