# ==============================================================================
# NOVASPHERE AI — PRODUCTION BACKEND DOCKERFILE
# Production container build using Java 21 LTS & Virtual Threads optimization
# ==============================================================================

FROM eclipse-temurin:21-jre-alpine
LABEL maintainer="NovaSphere AI Engineering Team <ops@novasphere.ai>"

# Install curl for container health check and timezone data
RUN apk add --no-cache curl tzdata

# Security: Create non-root system user and group
RUN addgroup -S omniagent && adduser -S omniagent -G omniagent

WORKDIR /app

# Copy application jar from target
COPY target/*.jar app.jar
RUN chown -R omniagent:omniagent /app

USER omniagent

# Expose Spring Boot port
EXPOSE 8080

# JVM & Memory Optimizations
ENV JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -Xms512m -Xmx2048m -Dfile.encoding=UTF-8"
ENV SPRING_PROFILES_ACTIVE=prod

# Container Healthcheck via Spring Boot Actuator
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
