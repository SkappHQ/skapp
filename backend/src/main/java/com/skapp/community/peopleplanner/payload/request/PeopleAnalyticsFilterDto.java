package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class PeopleAnalyticsFilterDto {

	private List<Long> teams;

}
