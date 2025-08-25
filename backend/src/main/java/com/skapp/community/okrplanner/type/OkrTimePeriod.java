package com.skapp.community.okrplanner.type;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public enum OkrTimePeriod {
    // Annual - no specific period needed
    ANNUAL(OkrFrequency.ANNUAL),

    // BI_ANNUAL periods
    FIRST_HALF(OkrFrequency.BI_ANNUAL),
    SECOND_HALF(OkrFrequency.BI_ANNUAL),

    // QUARTERLY periods
    Q1(OkrFrequency.QUARTERLY),
    Q2(OkrFrequency.QUARTERLY),
    Q3(OkrFrequency.QUARTERLY),
    Q4(OkrFrequency.QUARTERLY);

    private final OkrFrequency frequency;

    OkrTimePeriod(OkrFrequency frequency) {
        this.frequency = frequency;
    }

    public OkrFrequency getType() {
        return frequency;
    }

    public static List<OkrTimePeriod> getByType(OkrFrequency type) {
        return Arrays.stream(values())
                .filter(period -> period.getType() == type)
                .collect(Collectors.toList());
    }
}
