# -*- coding: utf-8 -*-

from app import db


class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(128), index=True, unique=True)
    project = db.Column(db.String(128), index=True, unique=True)
    name = db.Column(db.String(128), index=True)
    edition = db.Column(db.Integer)

    def __repr__(self):
        return '{}'.format(self.description)
