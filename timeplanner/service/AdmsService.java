package com.skapp.enterprise.timeplanner.service;

import jakarta.servlet.http.HttpServletRequest;

public interface AdmsService {

	String handleHandshake(String tenantId, String serialNumber, HttpServletRequest request);

	String receiveRecords(String tenantId, String serialNumber, String table, String stamp, String body,
			HttpServletRequest request);

	String getRequest(String tenantId, String serialNumber);

}
