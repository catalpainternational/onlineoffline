from .models import Person, Event, PersonEvent
from rest_framework import serializers


class PersonModelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id', 'person', 'email', 'phone')


class EventModelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'description', 'date')


class PersonEventModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonEvent
        fields = ('id', 'event', 'person', 'notice')
