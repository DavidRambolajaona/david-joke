from flask import Flask, render_template, url_for, request, redirect, jsonify
"""from flask_sqlalchemy import SQLAlchemy"""
from flask import current_app as app
from .models import db, User, Category, Joke, Configuration, Message
import random

@app.route('/')
@app.route('/index/')
def index() :
    jokes = Joke.query.all()
    if len(jokes) > 0 :
        random_joke = random.choice(jokes)
    else :
        random_joke = None
    return render_template("jokes.html", random_joke=random_joke, bgBlueDark=True)

@app.route('/jokes')
def jokes():
    jokes = Joke.query.order_by(Joke.joke_id.desc()).all()
    categories = Category.query.all()

    return render_template("manage_jokes.html", jokes=jokes, categories=categories)


@app.route('/register', methods=["GET", "POST"])
def register() :
    if request.method == 'POST' :
        nom = request.form["user_name"]
        mdp = request.form["user_password"]
        email = request.form["user_email"]
        user = User(nom, mdp, email)

        db.session.add(user)
        db.session.commit()

        return redirect("/")
    return render_template("register.html", bgBlueDark=True)


@app.route('/login')
def login() :
    return render_template("login.html", bgBlueDark=True)


@app.route('/managing-categories', methods=['GET', 'POST'])
def manageCategories() :
    if request.method == "POST" :
        text = request.form["category_text"]
        description = request.form["category_description"]
        user_id = 1
        #user = db.session.query(User).get(user_id)
        category = Category(text, description, user_id)

        db.session.add(category)
        db.session.commit()

        return redirect("/managing-categories")
    
    categories = Category.query.all()
    return render_template("manage_categories.html", categories=categories)


@app.route('/add-joke', methods=['POST'])
def addJoke() :
    if request.method == 'POST' :
        joke_category_id = request.form['add_joke_category_id']
        joke_text = request.form['add_joke_text']
        joke_user_id = 1
        joke = Joke(joke_text, joke_user_id, joke_category_id)
        
        db.session.add(joke)
        db.session.commit()

    return redirect('/jokes')


@app.route('/api/get-urls')
def getUrlsAPI() :
    ret = {"urls": {}}
    for rule in app.url_map.iter_rules() :
        if rule.endpoint in ["static"] :
            continue
        ret["urls"][rule.endpoint] = url_for(rule.endpoint)
    return jsonify(ret)

@app.route('/api/joke')
def getRandomJokeAPI() :
    random_joke = random.choice(Joke.query.all())
    ret = {}
    ret["joke_id"] = random_joke.joke_id
    ret["joke_text"] = random_joke.joke_text
    ret["joke_category"] = random_joke.joke_category.category_text
    ret["joke_user"] = random_joke.joke_user.user_name
    ret["joke_date_creation"] = random_joke.joke_date_creation
    ret["joke_date_last_modification"] = random_joke.joke_date_last_modification
    ret["joke_enabled"] = random_joke.joke_enabled
    return jsonify(ret)

@app.route('/api/jokes')
def getJokesAPI() :
    ret = {"success": False, "message": "", "data": None}
    jokes = Joke.query.order_by(Joke.joke_id.desc()).all()
    categories = Category.query.all();
    jokesList = []
    categoriesList = []
    for joke in jokes :
        jokeDict = {}
        jokeDict["joke_id"] = joke.joke_id
        jokeDict["joke_text"] = joke.joke_text
        jokeDict["joke_category"] = joke.joke_category.category_text
        jokeDict["joke_category_id"] = joke.joke_category.category_id
        jokeDict["joke_user"] = joke.joke_user.user_name
        dateFormatCreation = joke.joke_date_creation.strftime("%d/%m/%Y à %H:%M:%S GMT")
        jokeDict["joke_date_creation"] = dateFormatCreation
        dateFormatLastModif = joke.joke_date_last_modification.strftime("%d/%m/%Y à %H:%M:%S GMT")
        jokeDict["joke_date_last_modification"] = dateFormatLastModif
        jokeDict["joke_enabled"] = joke.joke_enabled
        jokesList.append(jokeDict)
    for cat in categories :
        catDict = {}
        catDict["category_id"] = cat.category_id
        catDict["category_text"] = cat.category_text
        categoriesList.append(catDict)
    d = {"joke":{}, "category": {}}
    d["joke"] = jokesList
    d["category"] = categoriesList
    ret["success"] = True
    ret["data"] = d
    return jsonify(ret)

@app.route('/api/save-joke', methods=['POST'])
def saveJokeAPI() :
    ret = {"success": False, "message": "", "data": None}
    return jsonify(ret)