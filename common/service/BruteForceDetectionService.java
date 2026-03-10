package com.skapp.enterprise.common.service;

public interface BruteForceDetectionService {

	void handleFailedSignInAttempt(String email);

	void resetFailedSignInAttempts(String email);

}
