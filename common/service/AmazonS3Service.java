package com.skapp.enterprise.common.service;

import java.io.InputStream;

public interface AmazonS3Service {

	InputStream downloadFile(String bucketName, String objectKey);

	void uploadFile(String bucketName, String objectKey, InputStream inputStream);

}
