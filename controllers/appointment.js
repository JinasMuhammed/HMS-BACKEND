var express = require ('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');
var bodyPaser = require ('body-parser');




  router.get('/', async function (req, res) {
    try {
        db.getallappointment(function (err, result) {
            if (err) {
                console.error('Error fetching appointment:', err);
                return res.status(500).json({ error: 'An error occurred while fetching appointment' });
            }
            res.status(200).json({ appointment: result });
        });
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

// Express POST route to handle form submission
router.post('/add_appointment', function (req, res) {
    const { patient_name, department, doctor_name, date, time, email, phone } = req.body;
  
    // Call database function to add the appointment
    db.add_appointment(patient_name, department, doctor_name, date, time, email, phone, function (err, result) {
      if (err) {
        console.error('Error adding appointment:', err);
        res.status(500).json({ message: 'Failed to add appointment' });
      } else {
        res.status(200).json({ message: 'Appointment added successfully' });
      }
    });
  });
  

router.get("/edit_appointment/:id", (req, res) => {
    const id = req.params.id;
    db.getappointmentbyid(id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(result[0]); // Return JSON response
    });
  });
  
  router.put("/edit_appointment/:id", (req, res) => {
    const id = req.params.id;
    const { patient_name, department, doctor_name, date, time, email, phone } = req.body;
  
    db.editappointment(id, patient_name, department, doctor_name, date, time, email, phone, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Update failed" });
      }
      res.json({ message: "Appointment updated successfully" });
    });
  });
  
  router.delete("/delete_appointment/:id", (req, res) => {
    const id = req.params.id;
    db.deleteappointment(id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Delete failed" });
      }
      res.json({ message: "Appointment deleted successfully" });
    });
  });
  
  









module.exports =router;