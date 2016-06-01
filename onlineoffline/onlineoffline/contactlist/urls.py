from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from rest_framework import routers

from .views import PersonViewSet, EventViewSet, PersonEventViewSet, IndexView, offline, persons

router = routers.DefaultRouter()
router.register(r'person', PersonViewSet)
router.register(r'event', EventViewSet)
router.register(r'personevent', PersonEventViewSet)


urlpatterns = [
    url(r'^$', login_required(persons), name='index'),
    url(r'^offline/$', offline, name='offline'),
    url(r'^api/', include(router.urls, namespace='api')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
    ]