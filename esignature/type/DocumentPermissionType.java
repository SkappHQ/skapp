package com.skapp.enterprise.esignature.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum DocumentPermissionType {

	READ("document:read"), WRITE("document:write");

	private final String value;

}
