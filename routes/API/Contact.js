
const express = require('express');
const router = express.Router();
const { check , validationResult} = require('express-validator');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const { EMAIL, PASSWORD } = require("../API/env");

const admin = require("firebase-admin");
const db = admin.firestore();
/************************************************************************************* */

const refparticipe = db.collection('Participation');
const refDonts = db.collection('Donnateurs');
const refurgence = db.collection('Bénéficiaires');

router.post("/Participer",async (req, res) => {


    try {

        await refparticipe.add(req.body);
         res.send('ok');

    } catch (error) {
            res.status(500).send(" il ya une erreur dans votre request ");
    }

});

router.post("/Alerte",async (req, res) => {
    try {

        await refurgence.add(req.body);
        res.send(" ok ");

    } catch (error) {
            res.status(500).send(" il ya une erreur dans votre request ");
    }

});
router.post("/Donts",async (req, res) => {
    try {

        await refDonts.add(req.body);
        res.send(" ok ");

    } catch (error) {
            res.status(500).send(" il ya une erreur dans votre request ");
    }

});

router.post("/", [
    check("email" ," l'email doit s'ecrire sous la forme 'exempele@gmail.com'").isEmail()
 ],async (req, res) => {

    let errors  = validationResult(req);

    if ( ! errors.isEmpty() )   return res.status(400).json({ "error" : errors.array()});

    try {
        const { email, Nom , msg } = req.body;
         
        let config = {
            service : 'gmail',
            auth : {
                user: EMAIL,
                pass: PASSWORD
            }
        }
    
        let transporter = nodemailer.createTransport(config);
    
        let MailGenerator = new Mailgen({
            theme: "salted", 
            product : {
                name:"دعاوي الخير ",
                link : 'https://mailgen.js/', //le site officiel
                copyright: 'Copyright © 2016 D3AWI EL KHIR . All rights reserved.'
            }
        })
    
        let text = {
            body: {
                greeting: ` Voici Un message de ${Nom}`,
                action: {
                    instructions:msg,
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: ' Repondre ',
                        link: `https://mail.google.com/mail/u/0/#inbox?compose=new`
                    }
                }
            }
        }
    
        let mail = MailGenerator.generate(text);
    
        let message = {
            from : EMAIL,
            to : "la_ouadi@esi.dz", // la boite mail de l'association 
            subject: `from ${email}`,
            html: mail
        }
    
        await transporter.sendMail(message).then(() => {
            return res.status(201).json({
                msg: "you should receive an email"
            })
        }).catch(error => {
            return res.status(500).json({ error })
        })
        
    } catch (error) {
            res.status(500).send(" il ya une erreur dans votre request ");
    }

});


module.exports = router;