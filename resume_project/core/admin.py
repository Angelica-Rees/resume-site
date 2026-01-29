from django.contrib import admin
from .models import Job, DescriptionItem, Project, SkillItem

# Register your models here.

admin.site.register(Job)
admin.site.register(DescriptionItem)
admin.site.register(SkillItem)
admin.site.register(Project)
