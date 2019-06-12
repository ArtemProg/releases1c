# -*- coding: utf-8 -*-

from app import db
from datetime import datetime


class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(128), index=True, unique=True)
    project = db.Column(db.String(128), index=True, unique=True)
    name = db.Column(db.String(128), index=True)
    edition = db.Column(db.Integer)
    releases = db.relationship('Release', backref='configuration', lazy='dynamic')

    def __repr__(self):
        return '{}'.format(self.description)


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
