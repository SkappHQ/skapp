package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.HolidayBulkRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidayFilterDto;
import com.skapp.community.peopleplanner.payload.request.HolidaysDeleteRequestDto;
import com.skapp.community.peopleplanner.service.HolidayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Tag(name = "Holiday Management", description = "Operations related to managing holidays")
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/holiday")
public class HolidayController {

	@NonNull
	private final HolidayService holidayService;

	@Operation(summary = "Get all holidays",
			description = "Retrieve all holidays with optional pagination, sorting, and filtering.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllHolidays(@Valid HolidayFilterDto holidayFilterDto) {
		ResponseEntityDto response = holidayService.getAllHolidays(holidayFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Add multiple holidays", description = "Save multiple holidays in bulk.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PostMapping(value = "/bulk", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> saveBulkHolidays(
			@Valid @RequestBody HolidayBulkRequestDto holidayBulkRequestDto) {
		ResponseEntityDto response = holidayService.saveBulkHolidays(holidayBulkRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get holidays by date", description = "Retrieve holidays for a specific date.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/{date}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getHolidaysByDate(@PathVariable LocalDate date) {
		ResponseEntityDto response = holidayService.getHolidaysByDate(date);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete all holidays", description = "Remove all holidays from the system.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@DeleteMapping(value = "/{year}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteAllHolidays(@PathVariable int year) {
		ResponseEntityDto response = holidayService.deleteAllHolidays(year);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete selected holidays", description = "Remove specific holidays provided in the request.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@DeleteMapping(value = "/selected", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteSelectedHolidays(
			@Valid @RequestBody HolidaysDeleteRequestDto holidayDeleteDto) {
		ResponseEntityDto response = holidayService.deleteSelectedHolidays(holidayDeleteDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
