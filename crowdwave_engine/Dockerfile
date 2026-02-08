# Crowdwave Simulation Engine
# Production Docker image

FROM python:3.12-slim

LABEL maintainer="Crowdwave" \
      version="1.0.0" \
      description="Survey simulation engine with 79% error reduction"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy package
COPY . /app/crowdwave_engine/

# Install the package
RUN pip install --no-cache-dir /app/crowdwave_engine/

# Expose API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Default command: run API server
CMD ["python", "-m", "crowdwave_engine.api"]
