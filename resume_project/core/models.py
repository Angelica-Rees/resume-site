import uuid
from django.db import models


class Job(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, null=True)
    date_started = models.DateField(null=False)
    date_ended = models.DateField(null=True, blank=True)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)

    def __str__(self):
        return f"{self.title}"


class DescriptionItem(models.Model):
    title = models.CharField()
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True)

    def __str__(self):
        return f"{self.title}"


class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    github_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title}"
