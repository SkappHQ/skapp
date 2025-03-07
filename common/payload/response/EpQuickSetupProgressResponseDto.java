package com.skapp.enterprise.common.payload.response;

import com.skapp.enterprise.common.type.QuickSetupType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class EpQuickSetupProgressResponseDto {

	private double progress;

	private Map<QuickSetupType, Boolean> quickSetupStatus;

	private Boolean isQuickSetupCompleted;

}
