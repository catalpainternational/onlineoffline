    export WORKON_HOME=$HOME/envs
    export PROJECT_HOME=$HOME/dev
    export PROJECT_NAME=onlineoffline
    source /usr/local/bin/virtualenvwrapper.sh
    mkvirtualenv -p python3 onlineoffline
    workon onlineoffline
    pip install --upgrade pip
    pip install Django
    cd $PROJECT_HOME && git clone https://github.com/catalpainternational/$PROJECT_NAME.git
    cdvirtualenv && echo $PROJECT_HOME/$PROJECT_NAME/ > .project
    cdproject
    django-admin startproject $PROJECT_NAME --template=https://github.com/catalpainternational/DjangoTemplate/zipball/master -n=README.md
    cd $PROJECT_NAME/$PROJECT_NAME
    pip install -r requirements.txt
    sed -i "s/{{ project_name }}/$PROJECT_NAME/g" bower.json
    bower install
    python manage.py migrate
    pip install django-extensions
    python manage.py createsuperuser
    python manage.py runserver 0.0.0.0:8001
    
    # Removing 
    #deactivate && rmvirtualenv onlineoffline && rm -rf $PROJECT_HOME/onlineoffline
    
