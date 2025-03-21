var express = require('express');
const mysql = require('mysql2');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require('./models/db_controller');
var sweetalert = require('sweetalert2');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// JWT Secret key - best practice is to keep it in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// MySQL connection
var con = mysql.createConnection({
    host: "process.env.DB_HOST",
    port: 13793,
    user: "ADMIN",
    password: "dbpass",
    database: "hms",
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.render('login.ejs');
});

router.post('/', [
    check('username').notEmpty().withMessage("Username is required"),
    check('password').notEmpty().withMessage("Password is required")
], function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }

    const username = request.body.username;
    const password = request.body.password;

    if (username && password) {
        con.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (error) {
                return response.status(500).send('Database error');
            }

            if (results.length > 0) {
                const user = results[0];
                const status = user.email_status;

                if (status == "not_verified") {
                    return response.status(403).send("Please verify your email.");
                } else {
                    // Generate JWT token
                    const token = jwt.sign(
                        { 
                            userId: user.id, 
                            username: user.username, 
                            role: user.role  // Include role in JWT payload
                        },
                        JWT_SECRET,
                        { expiresIn: '1h' }  // Token expiration time
                    );

                    // Send the token in the response
                    return response.status(200).json({
                        message: 'Login successful',
                        token: token
                    });
                }
            } else {
                return response.status(401).send('Incorrect username or password');
            }
        });
    } else {
        return response.status(400).send('Please enter username and password');
    }
});

module.exports = router;
