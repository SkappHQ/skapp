package com.skapp.enterprise.common.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import lombok.experimental.UtilityClass;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.dataformat.yaml.YAMLMapper;

import java.io.InputStream;

@UtilityClass
public class YamlReader {

	private static final YAMLMapper yamlMapper = YAMLMapper.builder().build();

	public static <T> T read(String path, Class<T> clazz) {
		try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
			return yamlMapper.readValue(inputStream, clazz);
		}
		catch (Exception e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_YAML_READ_FAILED,
					new String[] { path, e.getMessage() });
		}
	}

}
