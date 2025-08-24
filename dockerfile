FROM python:3.12-slim

ARG DJANGO_ENV

ENV DJANGO_ENV=${DJANGO_ENV} \
  # python:
  PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  # pip:
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  # poetry:
  POETRY_VERSION=2.1.3 \
  POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry'

# System deps:
RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    bash \
    build-essential \
    curl \
    gettext \
    wget \
  # Cleaning cache:
  && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/* \
  && pip install "poetry==$POETRY_VERSION" && poetry --version

WORKDIR /resume_project

COPY ./resume_project .

# Install dependencies:
RUN poetry install --no-root
RUN poetry run python manage.py migrate \
    && poetry run python manage.py loaddata core/fixtures/description_items.json \
    && poetry run python manage.py loaddata core/fixtures/jobs.json \
    && poetry run python manage.py loaddata core/fixtures/projects.json
# Expose port
EXPOSE 8000

CMD poetry run gunicorn resume_project.wsgi:application --bind 0.0.0.0:8000
