from crispy_forms.bootstrap import FormActions
from crispy_forms.helper import FormHelper
from crispy_forms.layout import ButtonHolder, Submit, Button, Layout, Field, HTML
from django import forms

from .models import Person, Event, PersonEvent


class PersonForm(forms.ModelForm):
    class Meta:
        model = Person
        exclude = ()

    def __init__(self, *args, **kwargs):
        super(PersonForm, self).__init__(*args, **kwargs)

    @property
    def helper(self):
        helper = FormHelper()
        helper.attrs = {'action': '/contactlist/api/person/', 'onsubmit':'{ add }', 'method':'POST'}
        helper.form_id = "person-form"
        helper.form_class = 'form-horizontal'

        helper.layout = Layout(
            Field('person', rows=1, cols=20),
            Field('email', rows=1, cols=20),
            Field('phone', rows=1, cols=20),
        )

        helper.layout.append(
            ButtonHolder(
                Submit('submit', 'Add', css_class='btn btn-sm btn-default', ),
                HTML("<button class='btn btn-sm btn-default', onclick = '{ person_edit_hide }'>Cancel</button>")
            )
        )
        return helper


class PersonEditForm(forms.ModelForm):
    class Meta:
        model = Person
        exclude = ()

    def __init__(self, *args, **kwargs):
        super(PersonEditForm, self).__init__(*args, **kwargs)

    @property
    def helper(self):
        helper = FormHelper()
        helper.attrs = {'action': '/contactlist/api/person/{ edit.id }/', 'onsubmit':'{ submit_edit }', 'method':'PUT'}
        helper.form_id = "person-edit-form"
        helper.form_class = 'form-horizontal'

        helper.layout = Layout(
            Field('person', id="person_edit_name", value='{ edit.person }', rows=1, cols=20),
            Field('email', id="person_edit_email", value='{ edit.email }', rows=1, cols=20),
            Field('phone', id="person_edit_phone", value='{ edit.phone }', rows=1, cols=20),
        )

        helper.layout.append(
            ButtonHolder(
                Submit('submit', 'Edit', css_class='btn btn-sm btn-default'),
                Button('cancel', 'Cancel', css_class='btn btn-sm btn-default', onclick = '{ person_edit_hide }')
            )
        )
        return helper

class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ()

    def __init__(self, *args, **kwargs):
        super(EventForm, self).__init__(*args, **kwargs)

    @property
    def helper(self):
        helper = FormHelper()
        helper.attrs = {'action': '/contactlist/api/event/'}
        helper.form_id = "event-form"
        helper.form_class = 'form-horizontal'
        helper.form_action = '{ submit }'

        return helper


class PersonEventForm(forms.ModelForm):
    class Meta:
        model = PersonEvent
        exclude = ()

    def __init__(self, *args, **kwargs):
        super(PersonEventForm, self).__init__(*args, **kwargs)

    @property
    def helper(self):
        helper = FormHelper()
        helper.attrs = {'action': '/contactlist/api/personevent/'}
        helper.form_id = "personevent-form"
        helper.form_class = 'form-horizontal'
        helper.layout = Layout(
            'person',
            'event',
            'notice'
        )
        helper.layout.append(
            FormActions(
            Submit('save', 'Save changes'),
            Button('cancel', 'Cancel')
        )
        )
        return helper
