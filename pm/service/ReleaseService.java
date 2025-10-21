package com.skapp.enterprise.pm.service;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;

public interface ReleaseService {

	byte[] generateReleasePdf(Long releaseId, String projectKey, HttpServletRequest request) throws IOException;

}
