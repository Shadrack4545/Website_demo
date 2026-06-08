FROM python:3.11-slim

# Set working directory to where the backend will live inside the image
WORKDIR /app/ml_backend

# Prevent Python from writing .pyc files and enable stdout/stderr buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install requirements from the repository's ml_backend/requirements.txt
COPY ../ml_backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Ensure packaging tools are up-to-date to avoid wheel/build issues
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy the backend source into /app/ml_backend explicitly so model files
# and artifacts (trained_model.pkl, json) are placed predictably.
COPY ../ml_backend ./

EXPOSE 5000

# Use gunicorn WSGI server to run the Flask app (server:app inside ml_backend)
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:5000", "--workers", "2"]
