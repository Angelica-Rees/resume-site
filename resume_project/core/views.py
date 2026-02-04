from django.shortcuts import render
from .models import Job, Project

from django.core.mail import send_mail
from django.conf import settings


def home(request):
    projects = Project.objects.all()
    return render(request, "home.html", {"projects": projects})


def jobs(request):
    items = Job.objects.all()
    return render(request, "jobs.html", {"jobs": items})


def projects(request):
    projects = Project.objects.all()
    return render(request, "projects.html", {"projects": projects})


def contact(request):
    context = {}
    if request.method == 'POST':
        message = request.POST['message']
        name = request.POST['name']
        is_sent = send_mail(
            name,
            message,
            settings.EMAIL_HOST_USER,
            [settings.EMAIL_HOST_USER],
            fail_silently = False
        )
        context["is_sent"] = is_sent
        
    return render(request, "contact.html", context = context)
