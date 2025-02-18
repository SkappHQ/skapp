package com.skapp.enterprise.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import lombok.experimental.UtilityClass;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@UtilityClass
public class YamlReader {

	private static final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

	public static <T> T read(String path, Class<T> clazz) {
		try (InputStream inputStream = new ClassPathResource(path).getInputStream()) {
			return yamlMapper.readValue(inputStream, clazz);
		}
		catch (Exception e) {
			throw new RuntimeException("Failed to load YAML configuration: " + path, e);
		}
	}

}
