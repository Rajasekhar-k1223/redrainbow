FROM python:3.11-slim

# Install system dependencies including nmap for live scanning
RUN apt-get update && \
    apt-get install -y nmap && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install specific security orchestration packages and docker SDK
RUN pip install --no-cache-dir bandit python-nmap python-multipart docker

# Copy the application code
COPY . .

# Expose the FastAPI port
EXPOSE 8080

# Run the server
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
