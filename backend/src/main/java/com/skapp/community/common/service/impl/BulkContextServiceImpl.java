package com.skapp.community.common.service.impl;

import com.skapp.community.common.service.BulkContextService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BulkContextServiceImpl implements BulkContextService {

	@Override
	public String getContext() {
		return null;
	}

	@Override
	public void setContext(String context) {
		// This is only for Enterprise context
	}

}
