package com.skapp.enterprise.common.service;

import java.util.Map;

public interface AmazonCloudFrontService {

	Map<String, String> generateCloudFrontDocumentSignedCookies(String path);

	Map<String, String> generateCloudFrontSignatureSignedCookies(boolean isInternal);

}
