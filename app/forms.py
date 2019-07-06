# -*- coding: utf-8 -*-

from flask_wtf import FlaskForm
from wtforms import IntegerField, StringField, PasswordField, BooleanField, SubmitField, TextAreaField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, Length


class LoginForm(FlaskForm):
    username = StringField('Логин', validators=[DataRequired()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    remember_me = BooleanField('Запомнить меня')
    submit = SubmitField('Войти')


class EditConfigurationForm(FlaskForm):
    id = IntegerField('id', validators=[DataRequired()])
    description = TextAreaField('description', validators=[Length(min=2, max=128)])
    project = StringField('project', validators=[DataRequired()])
    name = StringField('name', validators=[DataRequired()])
    edition = IntegerField('edition', validators=[DataRequired()])

    submit = SubmitField('Записать')