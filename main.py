# -*- coding: utf-8 -*-

from app import app, db
from app.models import Configuration


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Configuration': Configuration}


if __name__ == "__main__":
    app.run()