const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const crypto = require('crypto');
const { EMAIL, PASSWORD } = require("../API/env");
const admin = require("firebase-admin");
const db = admin.firestore();
/************************************************************************************* */

const InscriptionRef = db.collection('Demande');
const MembreRef = db.collection('Membre');

router.post("/", (req, res) => {

    try {
        const {
            nom,
            prenom,
            dateDeNaissance,
            sexe,
            telephone,
            lieuDeResidance,
            participe,
            detailParticip,
            situSocial,
            detailSitu,
            competence,
            raison,
            mail
        } = req.body;

        let exist_nom = InscriptionRef.where('nom', '==', nom).get();
        let exist_prenom = InscriptionRef.where('prenom', '==', prenom).get();
        let exist_mail = InscriptionRef.where('mail', '==', mail).get();

        if (!exist_nom.empty && !exist_prenom.empty && !exist_mail.empty)

            res.send(" Vous etes deja Inscrit ");
        InscriptionRef.add(req.body);
        res.send("");



    } catch (error) {
        res.status(500).send(" il ya une erreur dans votre request ");
    }

});
router.post("/membres", async (req, res) => {

    try {
        await MembreRef.add(req.body);
        res.send("");

    } catch (error) {
        res.status(500).send(" il ya une erreur dans votre request ");
    }

});



/************************************************************************************************************* */

router.post("/admin", async (req, res) => {

    try {

        const { email ,Nom } = req.body;
        /********************************************* Generer le mot de passe *************************************** */
        const password = crypto.randomBytes(8).toString('hex').slice(0, 8);

        /*******************************************************Creer l'email ************************************* */
        let config = {
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let MailGenerator = new Mailgen({
            theme: "salted",
            product: {
                name: "دعاوي الخير ",
                link: 'http://localhost:3000/', //le site officiel
                copyright: 'Copyright © 2016 D3AWI EL KHIR . All rights reserved.'
            }
        })

        let text = {
            body: {
                greeting: 'Salem',
                intro: " Vous êtes désormais considérer comme un admin de l'association دعاوي الخير , vous pouvez donc accéder à la plateforme des admins ",

                action: {
                    instructions: "Voici votre mot de passe ,connectez-vous avec le mot de passe donné et créez-en un nouveau dès que possible.  ",
                    button: {
                        color: '#31572c',
                        bold:true,
                        text: password
                    }
                },
                outro: 'Si vous avez des questions, n\'hésitez pas à nous contacter.'
            }
        }
        let mail = MailGenerator.generate(text);

        let message = {
            from: EMAIL,
            to: email,
            subject: " Félicitation " + Nom + " !",
            html: mail
        }

        await transporter.sendMail(message).then(() => {
            return res.status(201).json( password )
        }).catch(error => {
            return res.status(500).json({ error })
        });

    } catch (error) {
        res.status(500).send(" Il ya une erreur dans votre request ");
    }

});

module.exports = router;