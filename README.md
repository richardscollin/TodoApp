# TodoApp
This is a Todo app for GT WebDev.

## Dependencies
- [MongoDB](http://www.mongodb.org/)
- [Node](https://nodejs.org)

## Running the app
Clone the git repo:
```bash
$ git clone https://github.com/richardscollin/TodoApp.git
```
Install NPM dependencies:
```bash
$ npm install
```
Then:
```bash
$ npm start
```
A MongoDB url must be passed in the **MONGO_URL** environment variable. The default is `mongodb://localhost/todo_app`.

e.g.
```bash
$ MONGO_URL=mongodb://user:pass@hostname:port/db_name npm start
```
