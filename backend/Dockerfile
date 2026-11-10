# ==============================================================================
# OMNIAGENT / NOVASPHERE AI — PRODUCTION BACKEND DOCKERFILE
# Multi-stage build with Java 21 LTS & Virtual Threads optimization
# ==============================================================================

# Stage 1: Build & Package
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="NovaSphere AI Engineering Team <ops@novasphere.ai>"

# Install curl for container health check
RUN apk add --no-cache curl tzdata

# Security: Create non-root system user and group
RUN addgroup -S omniagent && adduser -S omniagent -G omniagent

WORKDIR /app

# Copy artifact from builder stage
COPY --from=builder /workspace/target/*.jar app.jar
RUN chown -R omniagent:omniagent /app

USER omniagent

# Expose Spring Boot port
EXPOSE 8080

# Environment defaults
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -Xms512m -Xmx2048m -Dfile.encoding=UTF-8"
ENV SPRING_PROFILES_ACTIVE=prod

# Container Healthcheck via Spring Boot Actuator
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
