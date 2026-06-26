package com.skapp.community.okrplanner.payload;

import com.skapp.community.okrplanner.type.OkrFrequency;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OkrConfigDto {

	private OkrFrequency frequency;

}
