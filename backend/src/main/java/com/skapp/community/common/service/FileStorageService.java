package com.skapp.community.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.FileType;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {

	ResponseEntityDto uploadFile(MultipartFile file, FileType type) throws IOException;

	ResponseEntity<Resource> getFile(String filename, FileType type, boolean isThumbnail);

	ResponseEntityDto getStorageAvailability();

	ResponseEntityDto updateFile(Long id, MultipartFile file, FileType type, String fileToUpdate);

}
