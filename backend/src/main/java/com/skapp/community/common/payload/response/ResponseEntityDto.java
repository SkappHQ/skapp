package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Setter
@Getter
public class ResponseEntityDto {

	private static final String SUCCESSFUL = "successful";

	private static final String UNSUCCESSFUL = "unsuccessful";

	private String status;

	private List<Object> results;

	public ResponseEntityDto() {
		status = SUCCESSFUL;
		results = new ArrayList<>();
	}

	public ResponseEntityDto(String message, boolean unsuccessful) {
		this();
		this.status = unsuccessful ? UNSUCCESSFUL : SUCCESSFUL;
		putToResults(new Acknowledgement(message));
	}

	public ResponseEntityDto(boolean unsuccessful, Object data) {
		this();
		status = unsuccessful ? UNSUCCESSFUL : SUCCESSFUL;
		putToResults(data);
	}

	public ResponseEntityDto(boolean unsuccessful, List<Object> data) {
		this();
		status = unsuccessful ? UNSUCCESSFUL : SUCCESSFUL;
		putToResults(data);
	}

	protected void putToResults(Object data) {
		if (data != null) {

			if (data instanceof Collection<?>) {
				results.addAll((Collection<?>) data);
			}
			else {
				results.add(data);
			}
		}
	}

}
