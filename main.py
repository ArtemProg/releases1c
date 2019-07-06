# -*- coding: utf-8 -*-

from app import app, db
from app.models import Configuration, Release, User


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Configuration': Configuration, 'Release': Release, 'User': User}


if __name__ == "__main__":
    app.run()
