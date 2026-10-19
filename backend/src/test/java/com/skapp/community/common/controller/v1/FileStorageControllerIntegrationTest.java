package com.skapp.community.common.controller.v1;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.config.FileStorageConfig;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.FileType;
import com.skapp.community.common.util.FileUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("File Storage Controller Integration Tests")
class FileStorageControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/file";

	private static final String UPLOAD_PATH = BASE_PATH + "/upload";

	private static final String MESSAGE_KEY_PATH = "['messageKey']";

	private static final String PLANTED_FILE_NAME = "planted.png";

	private static final String PLANTED_THUMBNAIL_NAME = "planted-thumbnail.png";

	private static final String MISSING_FILE_NAME = "a1b2c3d4-0000-0000-0000-000000000000.png";

	private static final int IMAGE_SIZE = 200;

	private static final Long EMPLOYEE_ID = 2L;

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final FileStorageConfig fileStorageConfig;

	private final EmployeeDao employeeDao;

	private String authToken;

	private Path storageDir;

	private Path userImageDir;

	private Set<Path> existingUserImages;

	@BeforeEach
	void setup() throws IOException {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);

		storageDir = FileUtil.getStorageDirectory(fileStorageConfig.getBase(), FileUtil.getParentDirectory())
			.toAbsolutePath()
			.normalize();
		userImageDir = storageDir.resolve(FileType.USER_IMAGE.label);
		Files.createDirectories(userImageDir);
		existingUserImages = listUserImages();
		Files.writeString(storageDir.resolve(PLANTED_FILE_NAME), "not an encrypted file", StandardCharsets.UTF_8);
		Files.writeString(storageDir.resolve(PLANTED_THUMBNAIL_NAME), "not an encrypted file", StandardCharsets.UTF_8);
	}

	@AfterEach
	void cleanup() throws IOException {
		Files.deleteIfExists(storageDir.resolve(PLANTED_FILE_NAME));
		Files.deleteIfExists(storageDir.resolve(PLANTED_THUMBNAIL_NAME));
		for (Path createdImage : listUserImages()) {
			if (!existingUserImages.contains(createdImage)) {
				Files.deleteIfExists(createdImage);
			}
		}
	}

	private Set<Path> listUserImages() throws IOException {
		try (Stream<Path> files = Files.list(userImageDir)) {
			return files.collect(Collectors.toSet());
		}
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetFile(String filename, boolean isThumbnail) throws Exception {
		return performRequest(get(BASE_PATH).param("type", FileType.USER_IMAGE.name())
			.param("filename", filename)
			.param("isThumbnail", String.valueOf(isThumbnail)));
	}

	private ResultActions performUpload(MockMultipartFile file, FileType type) throws Exception {
		return mvc.perform(multipart(UPLOAD_PATH).file(file)
			.param("type", type.name())
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performUpdateUserImage(MockMultipartFile file, String fileToUpdate) throws Exception {
		return mvc.perform(multipart(HttpMethod.PATCH, BASE_PATH + "/" + EMPLOYEE_ID).file(file)
			.param("type", FileType.USER_IMAGE.name())
			.param("fileToUpdate", fileToUpdate)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private String uploadUserImage() throws Exception {
		MockMultipartFile file = new MockMultipartFile("file", "avatar.png", MediaType.IMAGE_PNG_VALUE,
				createPngBytes());
		MvcResult uploadResult = performUpload(file, FileType.USER_IMAGE).andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andReturn();
		String message = JsonPath.read(uploadResult.getResponse().getContentAsString(), RESULTS_0_PATH + MESSAGE_PATH);
		return message.substring(message.lastIndexOf('/') + 1);
	}

	private void setEmployeeAuthPic(String authPic) {
		Employee employee = employeeDao.findById(EMPLOYEE_ID).orElseThrow();
		employee.setAuthPic(authPic);
		employeeDao.saveAndFlush(employee);
	}

	private void expectFileNotExist(ResultActions result) throws Exception {
		result.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_KEY_PATH)
				.value(CommonMessageConstant.COMMON_ERROR_FILE_NOT_EXIST.name()));
	}

	private byte[] createPngBytes() throws IOException {
		BufferedImage image = new BufferedImage(IMAGE_SIZE, IMAGE_SIZE, BufferedImage.TYPE_INT_RGB);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		ImageIO.write(image, "png", outputStream);
		return outputStream.toByteArray();
	}

	@Test
	@DisplayName("Get file by absolute path to an existing file - Returns the same error as a missing file")
	void getFile_AbsolutePathToExistingFile_ReturnsFileNotExist() throws Exception {
		expectFileNotExist(performGetFile(MISSING_FILE_NAME, false));
		expectFileNotExist(performGetFile(storageDir.resolve(PLANTED_FILE_NAME).toString(), false));
	}

	@Test
	@DisplayName("Get file by relative traversal outside the type folder - Returns file not exist")
	void getFile_RelativeTraversal_ReturnsFileNotExist() throws Exception {
		expectFileNotExist(performGetFile("../" + PLANTED_FILE_NAME, false));
	}

	@Test
	@DisplayName("Get thumbnail by absolute path to an existing file - Returns file not exist")
	void getThumbnail_AbsolutePathToExistingFile_ReturnsFileNotExist() throws Exception {
		expectFileNotExist(performGetFile(storageDir.resolve(PLANTED_FILE_NAME).toString(), true));
	}

	@Test
	@DisplayName("Update user image whose stored name traverses outside the type folder - Keeps the outside file")
	void updateFile_StoredNameTraversal_DoesNotDeleteOutsideFile() throws Exception {
		String traversalName = "../" + PLANTED_FILE_NAME;
		setEmployeeAuthPic(traversalName);
		MockMultipartFile file = new MockMultipartFile("file", "avatar.png", MediaType.IMAGE_PNG_VALUE,
				createPngBytes());

		performUpdateUserImage(file, traversalName).andExpect(status().isOk());

		assertThat(storageDir.resolve(PLANTED_FILE_NAME)).exists();
	}

	@Test
	@DisplayName("Upload a user image then download it and its thumbnail - Returns OK")
	void uploadFile_UserImage_DownloadsFileAndThumbnail() throws Exception {
		String storedName = uploadUserImage();

		performGetFile(storedName, false).andExpect(status().isOk());
		performGetFile(storedName, true).andExpect(status().isOk());
	}

	@Test
	@DisplayName("Update user image whose stored name is a plain file name - Deletes the previous image and thumbnail")
	void updateFile_PlainStoredName_DeletesPreviousImageAndThumbnail() throws Exception {
		String previousName = uploadUserImage();
		setEmployeeAuthPic(previousName);
		assertThat(userImageDir.resolve(FileUtil.getThumbnailName(previousName))).exists();
		MockMultipartFile file = new MockMultipartFile("file", "avatar.png", MediaType.IMAGE_PNG_VALUE,
				createPngBytes());

		performUpdateUserImage(file, previousName).andExpect(status().isOk());

		assertThat(userImageDir.resolve(previousName)).doesNotExist();
		assertThat(userImageDir.resolve(FileUtil.getThumbnailName(previousName))).doesNotExist();
	}

}