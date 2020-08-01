from flask import Flask, render_template, url_for, request, redirect, jsonify, session
from flask import current_app as app
from sqlalchemy import or_, and_
from .models import db, User, Category, Joke, Configuration, Message
import random
from datetime import datetime
import hashlib

@app.before_request
def beforeRequest():
    if "user_connected" not in session :
        session["user_connected"] = False
        if "user_info" not in session :
            session["user_info"] = {"user_id": None, "user_name": None}

@app.after_request
def afterRequest(response):
    # we have a response to manipulate, always return one
    return response

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
    if session["user_connected"] :
        return redirect("/logout")
    if request.method == 'POST' :
        nom = request.form["user_name"]
        mdp = request.form["user_password"]
        email = request.form["user_email"]
        user = User(nom, mdp, email)

        db.session.add(user)
        db.session.commit()

        session["user_connected"] = True
        session["user_info"] = {"user_id": user.user_id, "user_name": user.user_name}

        return redirect("/")
    return render_template("register.html", bgBlueDark=True)


@app.route('/login')
def login() :
    if session["user_connected"] :
        return redirect("/logout")
    return render_template("login.html", bgBlueDark=True)


@app.route('/managing-categories', methods=['GET', 'POST'])
def manageCategories() :
    if not session["user_connected"] :
        return redirect("/login")
    if request.method == "POST" :
        text = request.form["category_text"]
        description = request.form["category_description"]
        user_id = session["user_info"]["user_id"]
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
        if session["user_connected"] :
            joke_category_id = request.form['add_joke_category_id']
            joke_text = request.form['add_joke_text']
            joke_user_id = session["user_info"]["user_id"]
            joke = Joke(joke_text, joke_user_id, joke_category_id)
            
            db.session.add(joke)
            db.session.commit()

    return redirect('/jokes')

@app.route('/update-category', methods=['POST'])
def updateCategory() :
    if request.method == 'POST': 
        cat_id = request.form["category_id"]
        cat_text = request.form["category_text"]
        cat = Category.query.get(cat_id)
        cat.category_text = cat_text
        db.session.commit()
    return redirect("/managing-categories")

@app.route('/login-redirect', methods=['POST'])
def loginRedirect() :
    if request.method == 'POST' :
        user_name = request.form["user_name"]
        user = User.query.filter_by(user_name=user_name).first()
        user.user_date_last_connection = datetime.utcnow()
        session["user_connected"] = True
        session["user_info"] = {"user_id": user.user_id, "user_name": user.user_name}
        db.session.commit()
    return redirect('/jokes')

@app.route('/logout')
def logout() :
    session["user_connected"] = False
    session["user_info"] = {"user_id": None, "user_name": None}
    return redirect('/login')

@app.route('/user/<user_id>')
def userProfil(user_id) :
    user = User.query.get(user_id)
    return render_template("user_profil.html", user=user)

@app.route('/info')
def info() :
    return render_template("info.html")


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
        jokeDict["joke_editable"] = joke.joke_user.user_id == session["user_info"]["user_id"]
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
    ret = {"success": False, "message": "", "data": {}}
    joke_id = request.form["joke_id"]
    joke_enabled = request.form["joke_enabled"]
    joke_category_id = request.form["joke_category_id"]
    joke_text = request.form["joke_text"]
    
    joke = Joke.query.get(joke_id)
    if session["user_info"]["user_id"] == joke.joke_user.user_id :
        joke.joke_enabled = joke_enabled == "true"
        joke.joke_category_id = joke_category_id
        joke.joke_text = joke_text
        dateNow = datetime.utcnow()
        joke.joke_date_last_modification = dateNow

        db.session.commit()

        ret["success"] = True
        dateFormatLastModif = dateNow.strftime("%d/%m/%Y à %H:%M:%S GMT")
        ret["data"]["date_last_modification"] = dateFormatLastModif
    else :
        ret["message"] = "Différents ID. L'ID du créateur de la blague est différent de celui qui tente de sauvegarder."

    return jsonify(ret)

@app.route("/api/check-login", methods=["POST"])
def checkLoginAPI() :
    ret = {"success": False, "message": ""}
    user_name = request.form["user_name"]
    user_password = request.form["user_password"]
    user_password_md5 = hashlib.md5(user_password.encode('utf-8')).hexdigest()
    user = User.query.filter(and_(User.user_name==user_name, User.user_password==user_password_md5)).first()
    if user :
        ret["success"] = True
    return jsonify(ret)

@app.route("/api/check-name-user", methods=["POST"])
def checkNameUserAPI() :
    ret = {"success": False, "message": ""}
    user_name = request.form["user_name"]
    user = User.query.filter_by(user_name=user_name).first()
    if user :
        ret["success"] = True
    return jsonify(ret)