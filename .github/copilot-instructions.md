# GitHub Copilot Instructions

This repository is being migrated from shell-based CGI utilities to a modern Java Spring Boot application that will provide memo (root), SDV, and speech capture features via REST APIs and web UI.

## Environment
- Runtime: Java 17 (LTS)
- Framework: Spring Boot 3.x
- Build Tool: Maven (use `pom.xml` central dependency management)
- Web Server: Embedded Spring Boot (Tomcat) for development; optional Apache/Nginx reverse proxy in production
- Encoding: UTF-8 everywhere
- Container (optional): Multi-stage Docker build (`eclipse-temurin:17-jdk` base)

## Project Structure (Target)
```
memo/
	pom.xml
	src/
		main/
			java/
				com/example/memo/       (base package)
					MemoApplication.java  (Spring Boot entry point)
					controller/           (REST + MVC controllers)
					service/              (business logic)
					repository/           (Spring Data interfaces / JDBC templates)
					model/                (entities / DTOs / records)
					config/               (security, CORS, logging config)
					util/                 (helpers, mappers)
			resources/
				application.yml         (externalized config)
				static/                 (static assets if any)
				templates/              (Thymeleaf or other templates if server-side rendering)
				db/migration/           (Flyway SQL migrations)
		test/
			java/ (unit + integration tests)
```

## Coding Style
- Use Java 17 features (records, switch expressions) judiciously; keep readability high.
- Package by feature when module grows large (e.g., `memo`, `sdv`, `speech`) rather than only technical layers.
- Class naming: `*Controller`, `*Service`, `*Repository` suffices for clear roles.
- Prefer constructor injection (no field injection) for testability.
- Keep public APIs minimal; favor package-private where possible.
- Add Javadoc only where intent is non-obvious; rely on meaningful names.
- Use Lombok sparingly (only if added intentionally); default: plain Java.
- Ensure responses are JSON by default (`application/json; charset=UTF-8`).
- Include author email in top-level `README.md` instead of code headers: `Email: k.noguchi2005@gmail.com`.

## REST & API Guidelines
- Base path: `/api/v1` (e.g., `/api/v1/memo`, `/api/v1/sdv`, `/api/v1/speech`).
- Use standard HTTP verbs: GET (read), POST (create/process), PUT (replace), PATCH (partial update), DELETE (remove).
- Return proper status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.
- Validation errors -> 400 with structured payload `{ "error": "validation", "fields": { ... } }`.
- Use UUIDs for externally exposed identifiers unless sequential IDs are justified.

## Build & Run
- Local dev run: `mvn spring-boot:run`.
- Build jar: `mvn -DskipTests package` producing `target/memo-<version>.jar`.
- Run jar: `java -jar target/memo-<version>.jar`.
- Profile-specific config: `application-{env}.yml` (e.g., `application-prod.yml`). Activate via `--spring.profiles.active=prod`.

### Development Helper Script
- Use `./dev-run.sh start` (foreground) or `DAEMON=1 ./dev-run.sh start` (background) for consistent single-instance dev workflow.
- Commands: `start | stop | status | restart`.
- Environment knobs: `PORT`, `SPRING_PROFILE` (default `dev`), `DAEMON`, `JAR_MODE`, `LOG_DIR`, `OUT_LOG`, `ERR_LOG`, `MVN_OPTS`.
- Prefer this over ad-hoc `java -jar` during active development to avoid orphaned processes.

## Configuration (application.yml keys)
```
server:
	port: 8080
spring:
	datasource:
		url: jdbc:postgresql://localhost:5432/memo
		username: memo
		password: (externalized)
	jpa:
		hibernate:
			ddl-auto: validate
logging:
	level:
		root: INFO
		com.example.memo: DEBUG
```
Never commit real passwords or secrets—use environment variables or a secrets manager.

## Database & Migrations
- Use Flyway (preferred) for schema evolution. SQL files in `src/main/resources/db/migration/V<version>__<desc>.sql`.
- Keep each migration idempotent regarding data transformations where feasible.

## Testing Strategy
- Unit tests: JUnit 5 + AssertJ for fluent assertions.
- Web slice tests: `@WebMvcTest` for controllers.
- Integration tests: `@SpringBootTest` with Testcontainers (PostgreSQL) if DB-dependent.
- Use descriptive method names: `methodName_condition_expectedResult`.
- Minimum coverage target: core service logic >80%. Avoid chasing 100%.

## Error Handling
- Global exception handler via `@ControllerAdvice` producing JSON error payloads.
- Log stack traces at WARN/ERROR only once (avoid duplicate logging in both service and handler layers).

## Logging
- Use SLF4J (`private static final Logger log = LoggerFactory.getLogger(...);`).
- DEBUG for diagnostic, INFO for lifecycle and major actions, WARN for recoverable anomalies, ERROR for failures.
- Avoid logging sensitive data (passwords, tokens, raw personal info).

## Security
- Input validation: Bean Validation annotations + explicit checks for complex rules.
- Encode/escape any data rendered into templates (if using server-side views).
- Enforce JSON content type for API endpoints; reject unsupported types with 415.
- Rate limiting / auth can be added later; design endpoints stateless from start.
- Store secrets only in environment variables or external vault; never commit.
- Disable directory listing in any reverse proxy/web server layer.

## Performance & Scalability
- Keep controller methods lightweight; delegate to services.
- Use pagination for list endpoints (parameters: `page`, `size`, optional `sort`).
- Stream large downloads where appropriate (`ResponseEntity` with `InputStreamResource`).

## Dependency Management
- Avoid unnecessary starters; include only what you use (e.g., `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-data-jpa`).
- Version pin only when required; rely on Spring Boot dependency management BOM.

## Frontend (If Introduced Later)
- Serve static assets from `src/main/resources/static`.
- For SPA integration, consider CORS config in `config/WebCorsConfig`.

## Migration Notes
- Legacy CGI logic should be refactored into service classes; avoid executing shell commands from Java unless absolutely necessary.
- If temporary compatibility scripts are needed, isolate them in a `legacy/` module scheduled for removal.

## AI Assistance Usage Guidelines
- When generating code, ensure it follows the structure above.
- Do not reintroduce legacy shell pipeline assumptions.
- Prefer clear, testable service methods over large monolithic controllers.
- Always add/update tests for new features.

### Formatting / Content Restrictions
- Do not introduce emojis (no pictographic characters) in code, comments, commit messages, documentation, UI texts, or templates. Keep all output plain text without decorative emoji symbols.

## Checklist for New Features
1. Define request/response models (DTOs).
2. Add controller endpoint + validation.
3. Implement service logic (pure, testable).
4. Add repository/data access (if needed) + migration.
5. Write unit + integration tests.
6. Update documentation (README / OpenAPI spec).

## OpenAPI / Documentation (Optional Enhancement)
- Consider integrating `springdoc-openapi` for automatic API docs at `/swagger-ui.html`.

## Contact
Email: k.noguchi2005@gmail.com

---
These guidelines help maintain consistency during and after the migration. Update as the project evolves.
