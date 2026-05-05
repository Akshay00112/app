FROM python:3.10-slim

# Install system dependencies for audio processing and speech
RUN apt-get update && apt-get install -y \
    ffmpeg \
    espeak \
    espeak-ng \
    libsndfile1 \
    libespeak1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "--workers", "1", "--threads", "2", "app:create_app()"]
