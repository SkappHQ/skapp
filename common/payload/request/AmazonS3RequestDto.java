package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.AmazonS3ActionType;
import lombok.Data;

@Data
public class AmazonS3RequestDto {

	private String folderPath;

	private String type;

	private AmazonS3ActionType action;

}
