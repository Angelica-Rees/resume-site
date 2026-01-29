# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Django-based resume website that displays work experience, projects, and contact information. The project uses Poetry for dependency management and includes Docker support for containerized deployment.

## Development Commands

### Initial Setup
```bash
cd resume_project
poetry install                          # Install dependencies
poetry run python manage.py migrate     # Run database migrations
poetry run python manage.py loaddata core/fixtures/description_items.json
poetry run python manage.py loaddata core/fixtures/jobs.json
poetry run python manage.py loaddata core/fixtures/projects.json
```

### Running the Development Server
```bash
cd resume_project
poetry run python manage.py runserver   # Starts at http://127.0.0.1:8000
```

### Database Management
```bash
poetry run python manage.py makemigrations        # Create new migrations
poetry run python manage.py migrate               # Apply migrations
poetry run python manage.py createsuperuser       # Create admin user for /admin
poetry run python manage.py loaddata <fixture>    # Load fixture data
poetry run python manage.py dumpdata core.<model> --indent 2 > core/fixtures/<model>.json  # Export fixture
```

### Code Formatting
```bash
cd resume_project
poetry run black .                      # Format all Python files
```

### Docker Deployment
```bash
# From repository root
docker build -t resume-site .
docker run -p 8000:8000 resume-site
```

## Architecture

### Django Project Structure

The project consists of a single Django project (`resume_project`) with one app (`core`):

- **resume_project/**: Main Django project configuration
  - `settings.py`: Uses SQLite, has DEBUG=True (development), ALLOWED_HOSTS=['*']
  - `urls.py`: Routes `/admin` to admin panel, all other URLs to core app

- **core/**: Main application containing all models, views, and templates
  - All content is managed through this app
  - Admin interface registered for all models

### Data Models

**Job Model** ([core/models.py:5-17](resume_project/core/models.py#L5-L17)):
- Represents work experience entries
- Fields: `title`, `company`, `date_started`, `date_ended` (nullable), `current` (boolean)
- Uses UUID as primary key
- **Important ordering**: Jobs are sorted by `-current` (current jobs first) then `-date_started` (most recent first)

**DescriptionItem Model** ([core/models.py:20-26](resume_project/core/models.py#L20-L26)):
- Bullet points describing job responsibilities
- ForeignKey to Job (cascade delete)
- Each job can have multiple description items

**SkillItem Model** ([core/models.py:28-38](resume_project/core/models.py#L28-L38)):
- Skills associated with jobs
- ManyToMany relationship with Job through `jobs` field
- Uses `related_name="skills"` so jobs can access their skills via `job.skills.all()`

**Project Model** ([core/models.py:42-48](resume_project/core/models.py#L42-L48)):
- Portfolio projects
- Fields: `title`, `description`, `github_link` (optional)

### Views and URLs

All views are simple function-based views ([core/views.py](resume_project/core/views.py)):
- `home`: Displays home page
- `jobs`: Displays all Job objects (ordered by model Meta)
- `projects`: Displays all projects
- `contact`: Static contact page

URL structure ([core/urls.py](resume_project/core/urls.py)):
- `/` - Home page
- `/jobs/` - Work experience
- `/projects/` - Portfolio projects
- `/contact/` - Contact information
- `/admin/` - Django admin (requires authentication)

### Templates and Static Files

Templates are in `core/templates/`:
- `base.html`: Base template with shared layout
- Page templates: `home.html`, `jobs.html`, `projects.html`, `contact.html`
- `project_card.html`: Reusable component for project display

Static files in `core/static/`:
- `styles.css`: Main stylesheet
- `js/particles.js`, `js/carousel.js`, `js/pills.js`: UI interactions

### Data Fixtures

The project uses fixtures to seed initial data ([core/fixtures/](resume_project/core/fixtures/)):
- `jobs.json`: Job entries
- `description_items.json`: Job descriptions
- `projects.json`: Portfolio projects

When creating or modifying models, update corresponding fixtures and load them in the Dockerfile build process.

### Production Deployment

The Dockerfile:
1. Uses Python 3.12-slim base image
2. Installs Poetry 2.1.3
3. Installs dependencies via Poetry
4. Runs migrations and loads all fixtures during build
5. Serves with Gunicorn on port 8000

Production server uses Gunicorn WSGI server instead of Django's development server.
