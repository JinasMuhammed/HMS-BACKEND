var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');

var db = require.main.require('./models/db_controller'); // Database controller

// Middleware to parse request body
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


/** 
 * @route GET /users 
 * @desc Fetch all users 
 */
router.get('/', async function (req, res) {
    try {
        db.getAllUsers(function (err, result) {
            if (err) {
                console.error('Error fetching users:', err);
                return res.status(500).json({ error: 'An error occurred while fetching users' });
            }
            res.status(200).json({ users: result });
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/** 
 * @route POST /users/add 
 * @desc Add a new user with image upload 
 */
router.post('/add', function (req, res) {
    try {

        db.addUser(
            req.body.username,
            req.body.email,
            req.body.password,
            req.body.email_status,
            req.body.role,
            req.body.firstName,
            req.body.lastName,
            function (err, result) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ message: 'Something went wrong while adding the user.' });
                }

                console.log('User added successfully');
                res.status(200).json({ message: 'User added successfully!' });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

/** 
 * @route POST /users/edit/:id 
 * @desc Edit user details 
 */
router.put('/edit/:id', function (req, res) {
    const userId = req.params.id;

    db.editUser(
        userId,
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.role,
        req.body.firstName,
        req.body.lastName,
   
        function (err, result) {
            if (err) {
                console.error('Error updating user:', err);
                return res.status(500).json({ message: 'Something went wrong while updating the user.' });
            }

            console.log('User updated successfully');
            res.status(200).json({ message: 'User updated successfully!' });
        }
    );
});

/** 
 * @route GET /users/delete/:id 
 * @desc Delete a user
 */
router.get('/delete/:id', function (req, res) {
    const userId = req.params.id;

    db.getUserById(userId, function (err, result) {
        if (err) {
            console.error("Error retrieving user:", err);
            return res.status(500).json({ message: "Error retrieving user" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.render('delete_user.ejs', { user: result[0] });
    });
});

/** 
 * @route POST /users/delete/:id 
 * @desc Delete user from database
 */
router.delete('/delete/:id', function (req, res) {
    const userId = req.params.id;
  
    db.deleteUser(userId, function (err, result) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ message: 'Something went wrong while deleting the user.' });
      }
  
      console.log('User deleted successfully');
      res.status(200).json({ message: 'User deleted successfully!' });
    });
  });
  

/** 
 * @route POST /users/search 
 * @desc Search for users 
 */
router.post('/search', function (req, res) {
    var key = req.body.search;
    db.searchUser(key, function (err, result) {
        console.log(result);
    });
});

module.exports = router;
