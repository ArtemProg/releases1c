# -*- coding: utf-8 -*-

from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import login
from datetime import datetime
from pytz import timezone, utc


followers = db.Table('followers',
                     db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
                     db.Column('configuration_id', db.Integer, db.ForeignKey('configuration.id'))
                     )


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    configurations = db.relationship('Configuration', secondary=followers, backref=db.backref('users', lazy='dynamic'),
                                     lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def configuration_append(self, configuration):
        if not self.configuration_exists(configuration):
            self.configurations.append(configuration)

    def configuration_remove(self, configuration):
        if not self.configuration_exists(configuration):
            self.configurations.remove(configuration)

    def configuration_exists(self, configuration):
        return self.configurations.filter(followers.c.configuration_id == configuration.id).count() > 0


class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(128), index=True, unique=True)
    project = db.Column(db.String(128), index=True, unique=True)
    name = db.Column(db.String(128), index=True)
    edition = db.Column(db.Integer)
    active = db.Column(db.Boolean, default=False)
    releases = db.relationship('Release', backref='configuration', lazy='dynamic')

    def __repr__(self):
        return '{}'.format(self.description)

    def user_append(self, user):
        if not self.user_exists(user):
            self.users.append(user)

    def user_remove(self, user):
        if not self.user_exists(user):
            self.users.remove(user)

    def user_exists(self, user):
        return self.users.filter(followers.c.user_id == user.id).count() > 0


class Release(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    configuration_id = db.Column(db.Integer, db.ForeignKey('configuration.id'))
    version = db.Column(db.String(14), index=True)
    date = db.Column(db.DateTime, index=True)
    from_versions = db.Column(db.String(256))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('configuration_id', 'version'),)

    def __repr__(self):
        return '{}, версия {}'.format(self.configuration, self.version)

    @property
    def version_(self):
        return self.version.replace('.', '_')

    @property
    def from_versions_list(self):
        return [version for version in self.from_versions.split(';') if version]

    @property
    def date_mos(self):
        date = utc.localize(self.date, is_dst=None).astimezone(timezone('Europe/Moscow'))
        return date.strftime("%d.%m.%y")

    @property
    def days_difference(self):
        return abs((datetime.now() - self.date).days)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))
