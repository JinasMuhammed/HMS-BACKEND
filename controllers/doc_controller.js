var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require ('multer');
var fs = require ('fs');
var path = require ('path');


var db = require.main.require ('./models/db_controller');


// router.get('*', function(req, res, next){
// 	if(req.cookies['username'] == null){
// 		res.redirect('/login');
// 	}else{
// 		next();
// 	}
// });



var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, "public/assets/images/upload_images"); //here we specify the destination. in this case i specified the current directory
    },
    filename: function(req, file, cb) {
      console.log(file); //log the file object info in console
      cb(null, file.originalname);//here we specify the file saving name. in this case. 
  //i specified the original file name .you can modify this name to anything you want
    }
  });

  var upload = multer({ storage: storage });


// router.get('/',function(req,res){

//     db.getAllDoc(function(err,result){
//         if(err)
//         throw err;
//         res.render('doctors.ejs',{list : result})
//     });
    
// });
router.get('/', async function(req, res) {
    try {
        db.getAllDoc(function(err, result) {
            if (err) {
                console.error('Error fetching doctors:', err);
                return res.status(500).json({ error: 'An error occurred while fetching doctors' });
            }
            res.status(200).json({ doctors: result });
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/departments', function(req, res) {
    db.getalldept(function(err, result) {
        if (err) {
            console.error("Error retrieving departments:", err);
            res.status(500).json({ message: "Internal Server Error" });
        } else {
            res.json(result);  // Send the department data as JSON
        }
    });
});

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

router.get('/add_doctor',function(req,res){
    db.getalldept(function(err,result){
        res.render('add_doctor.ejs',{list:result});
    });

    
});

router.post('/add_doctor', upload.single("image"), function(req, res) {
    try {
        // Ensure file is uploaded
        const imageFilename = req.file ? req.file.filename : null;
        
        // Add the doctor to the database
        db.add_doctor(
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.dob,
            req.body.gender,
            req.body.address,
            req.body.phone,
            imageFilename, // Handle file upload
            req.body.department,
            req.body.biography,
            function(err, result) { // Callback to handle DB insertion response
                if (err) {
                    console.error('Error inserting doctor:', err);
                    return res.status(500).json({ message: 'Something went wrong while adding the doctor.' });
                }

                console.log('1 doctor inserted');
                // Return success response
                res.status(200).json({ message: 'Doctor added successfully!' });
            }
        );
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

    // router.get('/edit_doctor/:id',function(req,res){
    //     var id = req.params.id;

    //     db.getDocbyId(id,function(err,result){

            
    //             res.render('edit_doctor.ejs' ,{list : result});
           
            
    //     });
    // });

//     router.post('/edit_doctor/:id',function(req,res){
//         var id = req.params.id;
//         db.editDoc(id,req.body.first_name,req.body.last_name,req.body.email,req.body.dob,req.body.gender,req.body.address,req.body.phone,req.body.image,req.body.department,req.body.biography,function(err,result){
//             if (err) throw err;
            
//             //res.render('edit_doctor.ejs',{list:result});
//         res.redirect('back');
         
        
            
//         });
// });

// router.get('/delete_doctor/:id',function(req,res){
//     var id = req.params.id;
//     db.getDocbyId(id,function(err,result){
//         res.render('delete_doctor.ejs',{list:result})
//     });

    
// });

// router.post('/delete_doctor/:id',function(req,res){
//     var id = req.params.id;
//     db.deleteDoc(id,function(err,result){

//         res.redirect('/doctors');
//     });
// });







//  router.get('/search',function(req,res){
//      res.rende
//      var key = req.body.search;
//      console.log(key);
//     db.searchDoc(key,function(err, rows, fields) {
//         if (err) throw err;
//       var data=[];
//       for(i=0;i<rows.length;i++)
//         {
//           data.push(rows[i].first_name);
//         }
//         res.end(JSON.stringify(data));
//       });
//     });
router.post('/edit_doctor/:id', upload.single("image"), function(req, res) {
    const doctorId = req.params.id; // Get the doctor's ID from the route parameter

    // Check if the image was uploaded, if not use the existing one
    const imageFilename = req.file ? req.file.filename : req.body.image;

    // Update the doctor's information in the database
    db.editDoc(
        doctorId,
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.dob,
        req.body.gender,
        req.body.address,
        req.body.phone,
        imageFilename, // Use the updated image if uploaded
        req.body.department,
        req.body.biography,
        function(err, result) {
            if (err) {
                console.error('Error updating doctor:', err);
                return res.status(500).json({ message: 'Something went wrong while updating the doctor.' });
            }

            console.log('Doctor updated successfully');
            res.status(200).json({ message: 'Doctor updated successfully!' });
        }
    );
});

router.get('/delete_doctor/:id', function(req, res) {
    var doctorId = req.params.id;

    // Fetch the doctor details first to confirm and handle any dependent resources like images if needed
    db.getDocbyId(doctorId, function(err, result) {
        if (err) {
            console.error("Error retrieving doctor:", err);
            return res.status(500).json({ message: "Error retrieving doctor" });
        }

        // Check if doctor exists
        if (result.length === 0) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Render the confirmation page (optional - you can also show it on the frontend directly)
        res.render('delete_doctor.ejs', { doctor: result[0] });
    });
});

router.post('/delete_doctor/:id', function(req, res) {
    var doctorId = req.params.id;

    // Delete the doctor from the database
    db.deleteDoc(doctorId, function(err, result) {
        if (err) {
            console.error("Error deleting doctor:", err);
            return res.status(500).json({ message: "Error deleting doctor" });
        }

        console.log("Doctor deleted successfully");
        res.redirect('/doctors'); // Redirect to the doctors list or wherever appropriate
    });
});


    // router.get('/',function(req,res){

    //     db.getAllDoc(function(err,result){
    //         if(err)
    //         throw err;
    //         res.render('doctors.ejs',{list : result})
    //     });
        
    // });


    router.post('/search',function(req,res){
        var key = req.body.search;
        db.searchDoc(key,function(err,result){
            console.log(result);
            
            // res.render('doctors.ejs',{list : result});
        });
    });

module.exports = router;