const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mysql = require('mysql');
const methodOverride = require('method-override');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(methodOverride('_method'));
 

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'rohan',
    password: 'MYsql@12345',
    database: 'todoapp'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err);
        return;
    }
    console.log('Connected to MySQL database');
});


function getTodos(callback) {
    const query = 'SELECT * FROM todos';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching todos from MySQL database: ', err);
            return callback([]);
        }
        callback(results);
    });
}
function addTodo(title, description, callback) {
    const query = 'INSERT INTO todos (title, description) VALUES (?, ?)';
    connection.query(query, [title, description], (err, result) => {
        if (err) {
            console.error('Error adding todo to MySQL database: ', err);
            return callback(false);
        }
        callback(true);
    });
}



app.get('/', (req, res) => {
    getTodos((todos) => {
        res.render('index', { todos });
    });
});


app.post('/', (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    addTodo(title, description, (success) => {
        if (success) {
            res.redirect('/');
        } else {
            res.status(500).send('Error adding todo');
        }
    });
});

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM todos WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting todo from MySQL database: ', err);
            res.status(500).send('Error deleting todo');
            return;
        }
        console.log(`Deleted todo with id ${id}`);
        res.sendStatus(204);
    });
});

app.put('/todos/:id', (req, res) => {
    const id = req.params.id;
    const newTitle = req.body.title;
    const newDescription = req.body.description;

    const query = 'UPDATE todos SET title = ?, description = ? WHERE id = ?';
    connection.query(query, [newTitle, newDescription, id], (err, result) => {
        if (err) {
            console.error('Error updating todo in MySQL database: ', err);
            res.status(500).send('Error updating todo');
            return;
        }
        console.log(`Updated todo with id ${id}`);
        res.redirect('/');
    });
});



app.listen(3000, function () {
    console.log("server started at 3000")
})



