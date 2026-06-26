package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.FileStorageService;
import com.skapp.community.common.type.FileType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/file")
@Tag(name = "File Storage Controller", description = "Operations related to file storage functionalities")
public class FileStorageController {

	final FileStorageService fileStorageService;

	@Operation(summary = "Upload a file", description = "Uploads a file of the specified type.")
	@PostMapping(value = "/upload", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> uploadFile(@RequestParam("file") MultipartFile file,
			@RequestParam("type") FileType type) throws IOException {

		ResponseEntityDto response = fileStorageService.uploadFile(file, type);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Download a file", description = "Fetches a file by its name and type.")
	@GetMapping(produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
	public ResponseEntity<Resource> getFile(@RequestParam("type") FileType type,
			@RequestParam("filename") String filename, @RequestParam("isThumbnail") boolean isThumbnail) {

		return fileStorageService.getFile(filename, type, isThumbnail);
	}

	@Operation(summary = "File storage availability", description = "Returns the available disk storage")
	@GetMapping(value = "/storage/availability", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntityDto getStorageAvailability() {
		return fileStorageService.getStorageAvailability();
	}

	@Operation(summary = "Update a file", description = "Update an existing file with a new one.")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateFile(@PathVariable Long id, @RequestParam("file") MultipartFile file,
			@RequestParam("type") FileType type, @RequestParam("fileToUpdate") String fileToUpdate) {

		ResponseEntityDto response = fileStorageService.updateFile(id, file, type, fileToUpdate);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
