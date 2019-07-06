# -*- coding: utf-8 -*-

from app import app, cache
from flask import render_template, jsonify, request, url_for, redirect
from werkzeug.urls import url_parse
from app.inforeleases import available_configurations, current_configuration_releases, configuration_release_table, external_ref, soft_ref, current_configuration_releases_new, configurations, change_configuration
from flask_login import current_user, login_user, logout_user, login_required
from app.models import User
from app.forms import LoginForm


@app.route("/")
@app.route("/index")
def index():
    # return app.send_static_file('index.html')
    return render_template('index.html', title='Релизы',
                           external_links=external_ref(),
                           soft_links=soft_ref(),
                           releases=current_configuration_releases_new())


@app.route("/admin")
@login_required
def admin():
    form = LoginForm()
    return render_template('admin.html', title='Релизы', configurations=configurations(), external_links=external_ref(),
                           form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Релизы', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/api/save', methods=['POST'])
def set_configuration():
    configuration = dict(request.json['configuration'])
    action = request.json['action']

    result = change_configuration(configuration, action)

    return jsonify(result)


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
