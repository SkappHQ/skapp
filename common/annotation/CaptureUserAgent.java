package com.skapp.enterprise.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark controller methods that require User-Agent capture for audit trails.
 * When applied to a method, the User-Agent header from the HTTP request will be stored in
 * AuditRequestContext for the duration of the request.
 *
 * <p>
 * Example usage: <pre>
 * &#64;CaptureUserAgent
 * &#64;GetMapping("/documents/{id}")
 * public ResponseEntity&lt;DocumentDto&gt; getDocument(@PathVariable Long id) {
 *     // User-Agent is available in AuditRequestContext
 * }
 * </pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CaptureUserAgent {

}
