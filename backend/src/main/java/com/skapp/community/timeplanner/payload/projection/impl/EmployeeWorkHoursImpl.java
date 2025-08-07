package com.skapp.community.timeplanner.payload.projection.impl;

import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;

import java.time.LocalDate;

public class EmployeeWorkHoursImpl implements EmployeeWorkHours {
    private final LocalDate date;
    private final Double workedHours;

    public EmployeeWorkHoursImpl(LocalDate date, Double workedHours) {
        this.date = date;
        this.workedHours = workedHours;
    }

    @Override
    public LocalDate getDate() {
        return date;
    }

    @Override
    public Double getWorkedHours() {
        return workedHours;
    }
}