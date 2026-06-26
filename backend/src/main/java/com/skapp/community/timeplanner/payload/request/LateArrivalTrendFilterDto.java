package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.TrendPeriod;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LateArrivalTrendFilterDto {

	private List<Long> teams;

	private TrendPeriod trendPeriod;

}
