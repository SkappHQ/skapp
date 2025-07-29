package com.skapp.community.okrplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.type.KeyResultType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/key-result-types")
public class KeyResultTypeController {

	// TODO: Change the role to ROLE_OKR_MANAGER when the role is created
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getKeyResultTypes() {
		ResponseEntityDto responseEntityDto = new ResponseEntityDto(false, KeyResultType.getAllTypes());

		return ResponseEntity.ok(responseEntityDto);
	}

}
