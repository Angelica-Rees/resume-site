from django.shortcuts import render
from .models import Job, Project


def home(request):
    projects = Project.objects.all()
    return render(request, "home.html", {"projects": projects})


def jobs(request):
    items = Job.objects.all()
    return render(request, "jobs.html", {"jobs": items})


def projects(request):
    projects = Project.objects.all()
    return render(request, "projects_alternative.html", {"projects": projects})


def contact(request):
    return render(request, "contact.html")
