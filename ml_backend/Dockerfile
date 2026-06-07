FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and enable stdout/stderr buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source
COPY . .

EXPOSE 5000

# Use gunicorn WSGI server to run the Flask app
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:5000", "--workers", "2"]
