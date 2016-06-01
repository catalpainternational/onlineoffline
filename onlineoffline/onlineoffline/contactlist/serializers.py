from .models import Person, Event, PersonEvent
from rest_framework import serializers


class PersonModelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('person','email','phone')


class EventModelSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('name','description','date')


class PersonEventModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonEvent
        fields = ('event','person','notice')