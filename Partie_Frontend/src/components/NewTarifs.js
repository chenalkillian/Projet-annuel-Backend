import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewTarifs.css';  // Assurez-vous que ce fichier contient les styles adaptés
import jsPDF from 'jspdf';
import logo from '../img/logocard.png';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import Video from '../img/city-night-panorama-moewalls-com.mp4'
//composant permettant l'ajout de 20Go sur le compte du user
function NewTarifs() {
    const [id, setID] = useState();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [adressePostal, setAdressePostal] = useState('');
    const [nomSociete, setNomSociete] = useState('');
    const [adrSociete, setAdrSociete] = useState('');
    const [siret, setSiret] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardDate, setCardDate] = useState('');
    const [cardCode, setCardCode] = useState('');
    const [token, setToken] = useState('');
    const [stockagedisponible, setStockagedisponible] = useState('');

    useEffect(() => {
        const value = Cookies.get('token');
        if (value) {
            const tokenData = JSON.parse(value);
            const decodedToken = jwtDecode(tokenData);

            setID(decodedToken.id);
            setEmail(decodedToken.email);
            setNom(decodedToken.nom);
            setPrenom(decodedToken.prenom);
            setAdressePostal(decodedToken.adresse_postale);
            setNomSociete(decodedToken.nomsociete);
            setAdrSociete(decodedToken.adresse_postale_societe);
            setSiret(decodedToken.siret);
            setToken(tokenData);

        } else {
            window.location.href = '/Denied';
        }
    }, []);


    //function de génération d'un fichier pdf qui sert de ticket pour le nouvel achat
    const generateTicketPDF = async () => {
        const doc = new jsPDF();
        const formattedDate = new Date().toLocaleDateString('fr-FR');
        const content = `
          Voici votre facture:
          Voici votre facture pour l'achat supplémentaire de 20Go de stockage.
          Vous avez donc 40Go de stockage !

          Nom:                                                  ${nom}
          Prénom:                                               ${prenom} 
          Adresse postale:                                      ${adressePostal}
          Nom de société:                                       ${nomSociete}
          Adresse postale de la société:                        ${adrSociete}
          SIRET:                                                ${siret} 
          Date de la facture:                                   ${formattedDate}
          Désignation:
          Quantité: 1
          Total hors taxe: 17,50 €
          Prix unitaire hors taxe:
          Montant de la TVA:
          Montant toutes taxes comprises à régler: 20€
        `;
        doc.text(content, 10, 10);

        // Convertir le PDF en blob
        const pdfBlob = doc.output('blob');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(pdfBlob);
            reader.onloadend = async function () {
                try {
                    await axios.post('http://localhost:8000/user/senmail', {
                        to: email,
                        text: 'Voici votre facture',
                        fichier: reader.result.split(',')[1], // Extraire le contenu base64
                    });
                    alert('E-mail envoyé avec succès.');
                    await axios.post('http://localhost:8000/user/add20go', {
                    email: email,
                       
                    });

                    // Mettre à jour le stockage disponible
                    const { data } = await axios.post('http://localhost:8000/user/UserStockage', {
                        userID: id,
                    });

                    if (data) {
                         setStockagedisponible(data.stockagedisponible);
                        console.log('Stockage disponible:', data.stockageDisponible);
                    }
                    const stockage=data.stockageDisponible;
                   
                    const stockageFinal = (stockage - pdfBlob.size)+21473968372 ;
                   
                    // Envoyer le fichier PDF
                    const formData = new FormData();
                    formData.append('file', pdfBlob, 'facture.pdf');
                    formData.append('nom', 'Facture du supplément de stockage.pdf');
                    formData.append('taille', pdfBlob.size);
                    formData.append('userid', id);
                    formData.append('stockagedisponible', stockageFinal); // Vérifiez cette valeur
                    formData.append('type', 'pdf');

                    await axios.post('http://localhost:8000/file/addFile', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    window.location.href = '/User';
                } catch (error) {
                    alert('Erreur lors de l\'envoi de l\'e-mail ou de la mise à jour du stockage.');
                    console.error('Erreur:', error);
                }
            };
        } catch (error) {
            alert('Erreur lors de la génération de la facture.');
            console.error('Erreur:', error);
        }
    };

//on appelle la function de génération de ticket et d'email lors du clique pour valider
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            alert('Un email vous a été envoyé avec votre facture.');
            await generateTicketPDF();
            window.location.href=('/User')
        } catch (error) {
            setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
            console.error('Erreur lors de la soumission:', error);
        }
    };

    return (
        <>   <video autoPlay muted loop className="background-video">
        <source src={Video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

            <h1 className='titleachat'>Achat de 20Go supplémentaire !</h1>
            <div className='moreStock'>
                <form onSubmit={handleSubmit} className="credit-card-form">
                    <img className='logo' src={logo} alt="Logo" />

                    <div className="form-group">
                        <label className='label-card'>Nom du propriétaire:</label>
                        <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            maxLength="30"
                            placeholder="Nom sur la carte"
                            required
                            className="card-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className='label-card'>Numéro de carte bancaire:</label>
                        <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength="19"
                            placeholder="XXXX XXXX XXXX XXXX"
                            required
                            className="card-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className='label-card'>Date d'expiration:</label>
                        <input
                            type="text"
                            value={cardDate}
                            onChange={(e) => setCardDate(e.target.value)}
                            placeholder="MM/AA"
                            required
                            className="card-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className='label-card'>Code secret:</label>
                        <input
                            type="text"
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value)}
                            maxLength="3"
                            placeholder="CVC"
                            required
                            className="card-input"
                        />
                    </div>

                    <button type="submit" className="pay-button">Payer</button>
                </form>
            </div>
        </>
    );
}

export default NewTarifs;
