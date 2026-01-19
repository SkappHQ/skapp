package com.skapp.enterprise.common.service;

import java.util.Map;

public interface AmazonCloudFrontService {

	Map<String, String> generateCloudFrontDocumentSignedCookies();

	Map<String, String> generateCloudFrontSignatureSignedCookies(boolean isInternal);

	Map<String, String> generateCloudFrontTemplateDocumentSignedCookies();

}
