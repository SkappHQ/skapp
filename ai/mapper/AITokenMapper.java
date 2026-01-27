package com.skapp.enterprise.ai.mapper;

import com.skapp.enterprise.ai.model.AIToken;
import com.skapp.enterprise.ai.payload.response.DailyTokenUsageResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AITokenMapper {

	DailyTokenUsageResponseDto aiTokenToDailyTokenUsageResponseDto(AIToken aiToken);

}
