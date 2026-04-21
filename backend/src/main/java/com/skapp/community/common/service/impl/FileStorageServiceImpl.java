package com.skapp.community.common.service.impl;

import com.skapp.community.common.config.FileStorageConfig;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.constant.FileConfigConstants;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.FileStorageService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.FileType;
import com.skapp.community.common.util.FileUtil;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequestAttachment;
import com.skapp.community.leaveplanner.repository.LeaveRequestDao;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

	private static final String ALGORITHM = "AES";

	private static final String TRANSFORMATION = "AES/GCM/NoPadding";

	private static final int GCM_IV_LENGTH = 12;

	private static final int GCM_TAG_LENGTH = 128;

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final FileStorageConfig fileStorageConfig;

	private final OrganizationDao organizationDao;

	private final LeaveRequestDao leaveRequestDao;

	private final MessageUtil messageUtil;

	private final UserService userService;

	@Value("${file.storage.encryption-key}")
	private String fileStorageEncryptionKey;

	@Override
	public ResponseEntityDto uploadFile(MultipartFile file, FileType type) {
		log.info("uploadFileSingle: execution started");
		Path targetDir = FileUtil.getTargetDirectory(type.label, fileStorageConfig.getFolders(),
				fileStorageConfig.getBase());
		if (!FileConfigConstants.FILE_LOGO_PATH.equals(type.label)
				&& !FileConfigConstants.FILE_PROFILE_PIC_PATH.equals(type.label)
				&& !FileConfigConstants.FILE_LEAVE_ATTACHMENTS_PATH.equals(type.label))
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_FILE_TYPE,
					new String[] { type.name() });

		assert targetDir != null;
		log.info("uploadFileSingle: File uploading started to the path : {}", targetDir);
		Path targetFilePath = targetDir.resolve(UUID.randomUUID() + "."
				+ FileUtil.getFileExtension(Objects.requireNonNull(file.getOriginalFilename())));
		File targetFile = targetFilePath.toFile();

		if (checkIfTotalStorageExceeds()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NO_ENOUGH_STORAGE);
		}

		try {

			file.transferTo(targetFile);

			if (FileConfigConstants.FILE_PROFILE_PIC_PATH.equals(type.label) && isSizeEnough(targetFile)
					&& FileUtil.isSupportedFormat(file.getOriginalFilename())) {

				checkIfFileWithSameNameExists(targetDir,
						FileUtil.getFileNameWithoutExtension(targetFilePath.getFileName().toString())
								+ FileConfigConstants.THUMBNAIL_SUFFIX);

				Path thumbnailFilePath = targetDir
					.resolve(FileUtil.getThumbnailName(targetFilePath.getFileName().toString()));
				createThumbnail(targetFile, thumbnailFilePath.toFile());
				encryptFile(thumbnailFilePath.toFile());
			}

			encryptFile(targetFile);

			String fileUrl = "/" + type + "/" + targetFilePath.getFileName().toString();
			log.info("File uploading success to the path : {}", targetDir);
			return new ResponseEntityDto(
					messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_FILE_UPLOAD, new String[] { fileUrl }),
					false);
		}
		catch (Exception e) {
			log.error("File uploading failed to the path : {}", targetDir);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FILE_UPLOAD,
					new String[] { file.getOriginalFilename() });

		}
	}

	@Override
	public ResponseEntity<Resource> getFile(String filename, FileType type, boolean isThumbnail) {
		log.info("getFile: execution started");

		Path targetDir = FileUtil.getTargetDirectory(type.label, fileStorageConfig.getFolders(),
				fileStorageConfig.getBase());

		if (targetDir == null) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_FILE_TYPE,
					new String[] { type.name() });
		}

		log.info("Reading file started from the path : {}", targetDir);
		Path filePath = targetDir.resolve(isThumbnail ? FileUtil.getThumbnailName(filename) : filename);
		File encryptedFile = filePath.toFile();

		if (!encryptedFile.exists() || !encryptedFile.isFile()) {
			log.error("File does not exist at path: {}", filePath);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FILE_NOT_EXIST, new String[] { filename });
		}

		try {
			byte[] decryptedBytes = decryptFile(encryptedFile);

			Resource resource = new ByteArrayResource(decryptedBytes);

			log.info("File successfully decrypted and ready to be served.");
			return ResponseEntity.ok().header("Content-Disposition", "inline; filename=" + filename).body(resource);
		}
		catch (Exception e) {
			log.error("Error when trying to read or decrypt the file: {}", filePath, e);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FILE_URL, new String[] { filename });
		}
	}

	@Override
	public ResponseEntityDto getStorageAvailability() {
		HashMap<String, Long> map = new HashMap<>();
		map.put("availableSpace", Math.round((double) getAvailableSpace() / getTotalSpace() * 100));
		return new ResponseEntityDto(false, map);
	}

	@Override
	public ResponseEntityDto updateFile(Long id, MultipartFile file, FileType type, String fileToUpdate) {
		log.info("uploadFile: execution started");
		User user = userService.getCurrentUser();
		Path targetDir = FileUtil.getTargetDirectory(type.label, fileStorageConfig.getFolders(),
				fileStorageConfig.getBase());
		if (!FileConfigConstants.FILE_LOGO_PATH.equals(type.label)
				&& !FileConfigConstants.FILE_PROFILE_PIC_PATH.equals(type.label)
				&& !FileConfigConstants.FILE_LEAVE_ATTACHMENTS_PATH.equals(type.label))
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_FILE_TYPE,
					new String[] { type.name() });

		assert targetDir != null;
		log.info("updateFile: File uploading started to the path : {}", targetDir);
		Path targetFilePath = targetDir.resolve(UUID.randomUUID() + "."
				+ FileUtil.getFileExtension(Objects.requireNonNull(file.getOriginalFilename())));
		File targetFile = targetFilePath.toFile();

		try {

			if (FileConfigConstants.FILE_PROFILE_PIC_PATH.equals(type.label)
					&& user.getEmployee().getEmployeeId().equals(id)) {
				deletePreviousUserImages(user.getEmployee(), type, fileToUpdate);

				if (checkIfTotalStorageExceeds()) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NO_ENOUGH_STORAGE);
				}

				file.transferTo(targetFile);
				if (isSizeEnough(targetFile) && FileUtil.isSupportedFormat(file.getOriginalFilename())) {
					Path thumbnailFilePath = targetDir
						.resolve(FileUtil.getThumbnailName(targetFilePath.getFileName().toString()));
					createThumbnail(targetFile, thumbnailFilePath.toFile());
					encryptFile(thumbnailFilePath.toFile());
					encryptFile(targetFile);
				}
			}
			else if (FileConfigConstants.FILE_LOGO_PATH.equals(type.label)) {
				Optional<Organization> organizationOptional = organizationDao.findTopByOrderByOrganizationIdDesc();
				if (organizationOptional.isPresent()) {
					deletePreviousOrganizationImages(organizationOptional.get(), type, fileToUpdate);

					if (checkIfTotalStorageExceeds()) {
						throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NO_ENOUGH_STORAGE);
					}

					file.transferTo(targetFile);
					encryptFile(targetFile);
				}
			}
			else if (FileConfigConstants.FILE_LEAVE_ATTACHMENTS_PATH.equals(type.label)) {
				Optional<LeaveRequest> leaveRequest = leaveRequestDao.findById(id);
				if (leaveRequest.isPresent()
						&& leaveRequest.get().getEmployee().getEmployeeId().equals(user.getUserId())) {
					deletePreviousLeaveRequestImages(leaveRequest.get(), type, fileToUpdate);

					if (checkIfTotalStorageExceeds()) {
						throw new ModuleException(CommonMessageConstant.COMMON_ERROR_NO_ENOUGH_STORAGE);
					}

					file.transferTo(targetFile);
					encryptFile(targetFile);
				}

			}

			String fileUrl = "/" + type + "/" + targetFilePath.getFileName().toString();
			log.info("File updating success to the path : {}", targetDir);
			return new ResponseEntityDto(
					messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_FILE_UPLOAD, new String[] { fileUrl }),
					false);
		}
		catch (Exception e) {
			log.error("File updating failed to the path : {}", targetDir);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_FILE_UPLOAD,
					new String[] { file.getOriginalFilename() });

		}
	}

	private void encryptFile(File file) throws IOException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeyException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException {
		SecretKey key = generateKey();

		byte[] iv = new byte[GCM_IV_LENGTH];
		SECURE_RANDOM.nextBytes(iv);

		Cipher cipher = Cipher.getInstance(TRANSFORMATION);
		GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
		cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec);

		byte[] inputBytes = readFileToByteArray(file);
		byte[] encryptedBytes = cipher.doFinal(inputBytes);

		byte[] outputBytes = ByteBuffer.allocate(iv.length + encryptedBytes.length).put(iv).put(encryptedBytes).array();

		writeByteArrayToFile(file, outputBytes);
	}

	private byte[] decryptFile(File file) throws IOException, NoSuchAlgorithmException, NoSuchPaddingException,
			InvalidKeyException, IllegalBlockSizeException, BadPaddingException, InvalidAlgorithmParameterException {
		SecretKey key = generateKey();

		byte[] fileBytes = readFileToByteArray(file);

		ByteBuffer byteBuffer = ByteBuffer.wrap(fileBytes);
		byte[] iv = new byte[GCM_IV_LENGTH];
		byteBuffer.get(iv);
		byte[] encryptedBytes = new byte[byteBuffer.remaining()];
		byteBuffer.get(encryptedBytes);

		Cipher cipher = Cipher.getInstance(TRANSFORMATION);
		GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
		cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec);

		return cipher.doFinal(encryptedBytes);
	}

	private SecretKey generateKey() {
		try {
			byte[] keyBytes = fileStorageEncryptionKey.getBytes(StandardCharsets.UTF_8);
			MessageDigest sha = MessageDigest.getInstance("SHA-256");
			keyBytes = sha.digest(keyBytes);
			return new SecretKeySpec(keyBytes, ALGORITHM);
		}
		catch (NoSuchAlgorithmException e) {
			log.error("Failed to generate encryption key: {}", e.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_DECRYPTION_SET_KEY_FAILED);
		}
	}

	private byte[] readFileToByteArray(File file) throws IOException {
		try (FileInputStream fis = new FileInputStream(file)) {
			return fis.readAllBytes();
		}
	}

	private void writeByteArrayToFile(File file, byte[] bytes) throws IOException {
		try (FileOutputStream fos = new FileOutputStream(file)) {
			fos.write(bytes);
		}
	}

	private void createThumbnail(File inputImage, File outputThumbnail) throws IOException {
		Thumbnails.of(inputImage)
			.size(FileConfigConstants.THUMBNAIL_WIDTH, FileConfigConstants.THUMBNAIL_HEIGHT)
			.toFile(outputThumbnail);
	}

	private boolean isSizeEnough(File file) throws IOException {
		BufferedImage img = Thumbnails.of(file).scale(1).asBufferedImage();
		return img.getWidth() >= FileConfigConstants.THUMBNAIL_WIDTH
				&& img.getHeight() >= FileConfigConstants.THUMBNAIL_HEIGHT;
	}

	private void checkIfFileWithSameNameExists(Path directoryPath, String targetName) throws IOException {

		if (!Files.isDirectory(directoryPath)) {
			throw new IllegalArgumentException("Provided path is not a directory: " + directoryPath);
		}

		try (Stream<Path> files = Files.list(directoryPath)) {
			files.filter(filePath -> {
				String fileName = filePath.getFileName().toString();
				int dotIndex = fileName.lastIndexOf('.');
				String nameWithoutExtension = (dotIndex == -1) ? fileName : fileName.substring(0, dotIndex);
				return nameWithoutExtension.equals(targetName);
			}).findFirst().map(filePath -> {
				try {
					return deleteAllFiles(filePath);
				}
				catch (IOException e) {
					log.error("Error while deleting file: {}", filePath, e);
					return false;
				}
			});
		}
	}

	private boolean checkIfTotalStorageExceeds() {
		return Math.round((double) getAvailableSpace() / getTotalSpace()
				* 100) <= FileConfigConstants.FILE_UPLOAD_LIMIT_IN_PERCENTAGE;
	}

	private long getAvailableSpace() {
		File file = new File(
				FileUtil.getStorageDirectory(fileStorageConfig.getBase(), FileUtil.getParentDirectory()).toUri());
		return file.getUsableSpace();
	}

	private long getTotalSpace() {
		File file = new File(
				FileUtil.getStorageDirectory(fileStorageConfig.getBase(), FileUtil.getParentDirectory()).toUri());
		return file.getTotalSpace();
	}

	private void deletePreviousUserImages(Employee employee, FileType fileType, String fileName) throws IOException {
		if (employee.getAuthPic() != null && employee.getAuthPic().equals(fileName)) {
			Path targetDir = FileUtil.getTargetDirectory(fileType.label, fileStorageConfig.getFolders(),
					fileStorageConfig.getBase());

			if (targetDir != null) {
				Path image = targetDir.resolve(fileName);
				deleteAllFiles(image);
				Path imageThumbnail = targetDir.resolve(FileUtil.getFileNameWithoutExtension(employee.getAuthPic())
						+ FileConfigConstants.THUMBNAIL_SUFFIX + "."
						+ FileUtil.getFileExtension(employee.getAuthPic()));
				deleteAllFiles(imageThumbnail);
			}
		}
	}

	private void deletePreviousOrganizationImages(Organization organization, FileType fileType, String fileName)
			throws IOException {
		if (organization.getOrganizationLogo() != null && organization.getOrganizationLogo().equals(fileName)) {
			Path targetDir = FileUtil.getTargetDirectory(fileType.label, fileStorageConfig.getFolders(),
					fileStorageConfig.getBase());
			assert targetDir != null;
			Path path = targetDir.resolve(fileName);
			deleteAllFiles(path);
		}
	}

	private void deletePreviousLeaveRequestImages(LeaveRequest leaveRequest, FileType fileType, String fileName)
			throws IOException {
		if (leaveRequest.getAttachments() != null && !leaveRequest.getAttachments().isEmpty()) {
			for (LeaveRequestAttachment attachment : leaveRequest.getAttachments()) {
				if (attachment.getUrl() != null && attachment.getUrl().equals(fileName)) {
					Path targetDir = FileUtil.getTargetDirectory(fileType.label, fileStorageConfig.getFolders(),
							fileStorageConfig.getBase());
					assert targetDir != null;
					Path path = targetDir.resolve(fileName);
					deleteAllFiles(path);
				}
			}

		}
	}

	private boolean deleteAllFiles(Path filePath) throws IOException {
		return Files.deleteIfExists(filePath);
	}

}
