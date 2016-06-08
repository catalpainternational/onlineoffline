from django.conf.urls import url
from .views import  serviceworker

urlpatterns = [
    url(r'serviceworker.js$', serviceworker, name='serviceworker'),
    ]