package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AmazonS3SignedUrlResponseDto {

	private String signedUrl;

}
