package com.skapp.community.common.controller.v1;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequiredArgsConstructor
public class RobotsController {

	private final ResourceLoader resourceLoader;

	@GetMapping(value = "/robots.txt", produces = "text/plain")
	public ResponseEntity<String> getRobotsTxt() throws IOException {
		Resource resource = resourceLoader.getResource("classpath:static/robots.txt");
		String content = Files.readString(Path.of(resource.getURI()));
		return ResponseEntity.ok(content);
	}

}
