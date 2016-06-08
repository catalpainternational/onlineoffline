from django.contrib.gis.db.models import PointField
from django.db import models
import json
# Create your models here.
from django.db.models.fields.related import ForeignKey
from django.db.models.fields import TextField, DateField


class Event(models.Model):
    def __str__(self):
        return '%s'%(self.name)
    name = TextField()
    # place = PointField(blank=True, null=True)
    description = TextField(blank=True, null=True)
    date = DateField(blank=True, null=True)
    # contact = ForeignKey('contactlist.Contact')

    @classmethod
    def serialize(cls):
        return json.dumps([{'id':p.id, 'name':p.name, 'description':p.description, 'date':p.date.isoformat()} for p in cls.objects.all()])


class Person(models.Model):

    def __str__(self):
        return '%s'%(self.person)


    person = TextField(blank=True, null=True)
    email = TextField(blank=True, null=True)
    phone = TextField(blank=True, null=True)

    @classmethod
    def serialize(cls):
        return json.dumps([{'id':p.id, 'person':p.person, 'email':p.email, 'phone':p.phone} for p in cls.objects.all()])


class PersonEvent(models.Model):

    def __str__(self):
        return "{} is going to {}".format(self.person, self.event)

    event = ForeignKey('Event')
    person = ForeignKey('Person')
    notice = TextField(blank=True, null=True)

    @classmethod
    def serialize(cls):
        return json.dumps([{'id':p.id, 'event':p.event.name, 'person':p.person.person, 'notice':p.notice} for p in cls.objects.all()])
