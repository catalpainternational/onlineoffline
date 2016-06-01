from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic.base import TemplateView

from rest_framework import viewsets

from .serializers import *
from .models import *


class IndexView(TemplateView):
    template_name = 'contactlist/index.html'


class PersonViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows persons to be viewed or edited.
    """
    queryset = Person.objects.all()
    serializer_class = PersonModelSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows persons to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventModelSerializer


class PersonEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows persons to be viewed or edited.
    """
    queryset = PersonEvent.objects.all()
    serializer_class = PersonEventModelSerializer


def persons(request):
    returns = render(request, 'contactlist/index.html',{'persons':Person.serialize()})
    returns['Service-Worker-Allowed'] = True
    return returns

def offline(request):
    returns = render(request, 'contactlist/offline.html')
    returns['Service-Worker-Allowed'] = True
    return returns