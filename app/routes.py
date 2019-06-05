# -*- coding: utf-8 -*-

from app import app
from flask import jsonify
from app.inforeleases import available_configurations, current_configuration_releases, configuration_release_table


@app.route("/")
@app.route("/index.html")
def route_root():
    return app.send_static_file('index.html')


@app.route('/api/configuration', methods=['GET'])
def get_available_configurations():
    return jsonify(available_configurations())


@app.route('/api/configuration/UpdInfo', methods=['GET'])
def get_current_configuration_releases():
    return jsonify(current_configuration_releases())


@app.route('/api/<configuration>/v8upd11', methods=['GET'])
def get_configuration_release_table(configuration):
    return jsonify(configuration_release_table(configuration))