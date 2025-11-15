FROM python:3.11-slim

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# copy project
COPY . /app

# install deps
RUN pip install --no-cache-dir -r requirements.txt

# expose port
EXPOSE 8000

# serve static via FastAPI and run uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
