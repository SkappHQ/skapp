package com.skapp.enterprise.common.payload;

import com.skapp.enterprise.common.type.CoreFeatureType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.EnumMap;

@Getter
@Setter
@AllArgsConstructor
public class FeatureRequestDto {

	private String tenant;

	private EnumMap<CoreFeatureType, Boolean> featureSettings;

}
