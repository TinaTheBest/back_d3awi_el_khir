const express = require('express');
const router = express.Router();
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
//const config = require('config');
const { check , validationResult} = require('express-validator');

const admin = require("firebase-admin");
const db = admin.firestore();

/****************************************************** Donnation *******************************************************/
const refDonation = db.collection("Donnation");


router.post("/" , [
    check("phone" , 'Faites entres un numero valide !').isMobilePhone()
],async (req, res) =>{
    
     const errors = validationResult(req);

     if ( ! errors.isEmpty() )   return res.status(400).json({ "error" : errors.array()});

    try {

        const {phone , domaine , somme } = req.body;
        let date = new Date("year-month-date");
        await refDonation.add({phone , domaine , somme ,date });
        res.send(" Insertion Valider ");

    } catch (error) {
        res.status(500).send(" il ya une erreur dans votre request ");
    }

});

module.exports = router;
