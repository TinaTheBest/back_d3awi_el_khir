const express = require('express');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

const { EMAIL, PASSWORD } = require("../API/env");
const router = express.Router();
//const bcrypt = require('bcryptjs');
//const jwt = require('jsonwebtoken');
const moment = require('moment');
const admin = require("firebase-admin");
const db = admin.firestore();
/************************************* Evenement ******************************************************/
const refevent = db.collection("Evénement");
const event_utiliRef = db.collection('Evenement_utilisateur');
const emailRef = db.collection('Email');

router.get("/", async (req, res) => {
  try {
    moment.locale('fr');
    const { startAfter, endBefore } = req.query;
    var query = refevent.orderBy('nom_event', 'desc').limit(2);
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    const snapshot = await query.get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      nom_event: doc.data().nom_event,
      discription: doc.data().discription,
      date: doc.data().date
    }));
    res.send(events);

  } catch (error) {
    return res.status(500).send(" il ya une erreur dans votre request ");
  }

});
/************************************************************************************************************************************** */
router.post("/Ajouter", async (req, res) => {
  try {


    const { nom_event, discription, date } = req.body;
    var event = await refevent.where('nom_event', '==', nom_event).get();

    if (!event.empty) return res.send( 'cet evenement existe auparavent' );

    await refevent.add({ nom_event, discription, date });
    return res.send(" Insertion valide ");

  } catch (error) {
    return res.status(500).send(" il y'a erreur dans votre request ");
  }

});
/************************************************************************************************************************************** */
router.put("/edit/:ID", async (req, res) => {

  if (req.body.ID)
    res.status(403).send(" vous ne pouvez pas modifier ce champ ");

  try {
    const { nom_event, discription, date } = req.body;
    await refevent.doc(req.params.ID).update( { nom_event, discription, date } );
    event_utiliRef.doc(req.params.ID).get().then(async (doc) => {
      if (doc.exists) await event_utiliRef.doc(req.params.ID).update( { nom_event, discription, date } );
    })
    res.send(" modifiee avec succes ");

  } catch (error) {
    return res.status(500).send(" il ya une erreur dans votre request ");
  }
});
/************************************************************************************************************************************** */
router.delete("/Cacher/:ID", async (req, res) => {

  try {

    await event_utiliRef.doc(req.params.ID).delete();
    return res.send(" Supprimer de l'événement l'utilisateur avec succes ");
  } catch (error) {
    return res.status(500).send(" il ya une erreur dans votre request ");
  }

});
/****************************************************************************************************************************/
router.post("/EmailNotifi", async (req, res) => {


  try {

    const {email} = req.body ;
    await emailRef.add({email});
    res.send(' Vous étes desormais abonnes ');

  } catch (error) {
    res.status(500).send(" il ya une erreur dans votre request ");
  }

});
/************************************************************************************************************************************** */
router.post("/Afficher", async (req, res) => {
  try {
    const { id, nom_event, discription, date } = req.body;
    await event_utiliRef.doc(id).set({ nom_event, discription, date });
  
    const snapshot = await emailRef.get();
    const emails = snapshot.docs.map(doc => doc.data().email);
  
    var config = {
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD
      }
    }
    var transporter = nodemailer.createTransport(config);
    var MailGenerator = new Mailgen({
      theme: "salted",
      product: {
        name: "دعاوي الخير ",
        link: 'https://mailgen.js/', 
        //le site officiel
        copyright: 'Copyright © 2016 دعاوي الخير  . All rights reserved.'
      }
    })
    var text = {
      body: {
        greeting: ` Salut !!`,
        intro: `  On Prepare à un nouvel Evenemenets le ${date} , On serait ravis que vous nous rejoiniez!`,
        action: {
          instructions: " Acceder au site aufficiel et rempliser le formulaire de participation, Cliquez sur le lien ci-dessous pour voir les détails.",
          button: {
            color: '#22BC66', 
            text: ' Repondre ',
            link: `http://localhost:3000/` 
            /*****************site officiell */
          }
        },
        outro: " Merci "
      }
    }
    var mail = MailGenerator.generate(text);
  
    for (const email of emails) {
      
       transporter.sendMail({
        from: EMAIL,
        to: ` ${email}`,
        subject: `Nouvel Evenements ${nom_event}`,
        html: mail
      }).then(()=>{
        res.send("des mail sont envoyer")
      }).catch((error)=>{
        res.send(error)
      })
    }
  
    return res.send("Ajouté à l'événement utilisateur avec succès");
  
  } catch (error) {
    return res.status(500).send("Il y a une erreur dans votre requête");
  }

});
/************************************************************************************************************************************** */
router.get("/event_utilisateur", async (req, res) => {

  try {

    const snapshot = await event_utiliRef.get();
    const event_utili = snapshot.docs.map(doc => ({
      id: doc.id,
      nom_event: doc.data().nom_event,
      discription: doc.data().discription,
      jour: moment(doc.data().date, "YYY MM DD").format('DD').toString(),
      mois: moment(doc.data().date, "YYY MM DD").format('MMM').toString()
    }));
    res.send(event_utili);

  } catch (error) {
    return res.status(500).send(" il ya une erreur dans votre request ");
  }
});
/************************************************************************************************************************************** */
router.get("/allEvent", async (req, res) => {

  try {

    const snapshot = await refevent.get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      nom_event: doc.data().nom_event,
      discription: doc.data().discription,
      date:doc.data().date
    }));
    res.send(events);

  } catch (error) {
    return res.status(500).send(" il ya une erreur dans votre request ");
  }
});
module.exports = router;


