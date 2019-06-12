# -*- coding: utf-8 -*-

from flask import Flask
from config import Configuration
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_caching import Cache

app = Flask(__name__)
app.config.from_object(Configuration)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

from app import routes, models
