# -*- coding: utf-8 -*-

from app import app, cache
from flask import jsonify, render_template
from app.inforeleases import available_configurations, current_configuration_releases, configuration_release_table, external_ref, soft_ref


@app.route("/")
@app.route("/index.html")
def route_root():
    # return app.send_static_file('index.html')
    return render_template('index.html', title='релизы', external_links=external_ref(), soft_links=soft_ref())


@app.route('/api/configuration', methods=['GET'])
@cache.cached(timeout=1800)
def get_available_configurations():
    return jsonify(available_configurations())


@app.route('/api/configuration/UpdInfo', methods=['GET'])
@cache.cached(timeout=1800)
def get_current_configuration_releases():
    return jsonify(current_configuration_releases())


@app.route('/api/<configuration>/v8upd11', methods=['GET'])
@cache.cached(timeout=1800)
def get_configuration_release_table(configuration):
    return jsonify(configuration_release_table(configuration))


@app.route('/api/instance_path', methods=['GET'])
def get_instance_path():
    return app.instance_path
