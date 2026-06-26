package com.skapp.community.common.config;

import com.skapp.community.common.constant.FileConfigConstants;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Setter
@Getter
@Configuration
@ConfigurationProperties(prefix = FileConfigConstants.FILE_UPLOAD_PATH)
public class FileStorageConfig {

	private List<String> folders;

	private String base;

}
