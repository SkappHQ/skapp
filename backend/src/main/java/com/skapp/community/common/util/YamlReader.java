package com.skapp.community.common.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
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
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_YAML_READ_FAILED,
					new String[] { path, e.getMessage() });
		}
	}

}
