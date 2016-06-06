from django.http import HttpResponse
from django.shortcuts import render
from django.views.generic.base import TemplateView

from rest_framework import viewsets

from .serializers import *
from .models import *
from .forms import *

class IndexView(TemplateView):
    template_name = 'contactlist/serviceworker_test.html'


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
    returns = render(request, 'contactlist/index.html',{
        'persons':Person.serialize(),
        'events':Event.serialize(),
        'personevents':PersonEvent.serialize(),
        'forms':{
            'person_add':PersonForm,
            'person_edit':PersonEditForm,
            'personevent':PersonEventForm,
            'event':EventForm
        },
        'hi':'Nope'
    })
    returns['Service-Worker-Allowed'] = True
    return returns

def offline(request):
    returns = render(request, 'contactlist/serviceworker_test.html',{
        'persons':Person.serialize(),
        'events':Event.serialize(),
        'personevents':PersonEvent.serialize(),
        'forms':{
            'person_add':PersonForm,
            'person_edit':PersonEditForm,
            'personevent':PersonEventForm,
            'event':EventForm
        },
        'hi':'Nope'
    })
    returns['Service-Worker-Allowed'] = True
    return returns

def serviceworker(request):
    return render(request, "contactlist/service-worker.js", content_type="application/javascript")