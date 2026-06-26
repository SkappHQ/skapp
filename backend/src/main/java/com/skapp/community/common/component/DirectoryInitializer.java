package com.skapp.community.common.component;

import com.skapp.community.common.config.FileStorageConfig;
import com.skapp.community.common.exception.FileUploadException;
import com.skapp.community.common.util.FileUtil;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Component
@AllArgsConstructor
@Slf4j
@Profile("!test")
public class DirectoryInitializer {

	private final FileStorageConfig fileStorageConfig;

	@PostConstruct
	public void createDirectory() {
		Path parentDir = FileUtil.getParentDirectory();
		String fileStoragePath = FileUtil.getStorageDirectory(fileStorageConfig.getBase(), parentDir).toString();
		List<String> storageFolders = fileStorageConfig.getFolders();
		try {
			createDirectoryIfNotExists(Paths.get(fileStoragePath));
			for (String folder : storageFolders) {
				createDirectoryIfNotExists(Paths.get(fileStoragePath, folder));
			}
			log.info("Directories initialized!");
		}
		catch (Exception e) {
			throw new FileUploadException(
					"Terminating the application. Critical error during startup due to Storage folder creation failure :"
							+ e.getMessage());
		}
	}

	private void createDirectoryIfNotExists(Path path) {
		File directory = path.toFile();
		if (!directory.exists() && !directory.mkdirs()) {
			log.error("Failed to create directory: {}", path);
		}
	}

}
