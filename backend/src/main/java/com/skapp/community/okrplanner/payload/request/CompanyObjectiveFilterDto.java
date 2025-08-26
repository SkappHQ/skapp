package com.skapp.community.okrplanner.payload.request;

import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class CompanyObjectiveFilterDto {

    @NonNull
    private Integer year;
}
