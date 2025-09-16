
import * as React from 'react';

interface ContactEmailTemplateProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const ContactEmailTemplate: React.FC<Readonly<ContactEmailTemplateProps>> = ({
  name,
  email,
  phone,
  message,
}) => (
  <div>
    <h1>Nouveau message du formulaire de contact</h1>
    <p>
      Vous avez reçu un nouveau message de <strong>{name}</strong>.
    </p>
    <h2>Détails :</h2>
    <ul>
      <li><strong>Email :</strong> <a href={`mailto:${email}`}>{email}</a></li>
      {phone && <li><strong>Téléphone :</strong> {phone}</li>}
    </ul>
    <h2>Message :</h2>
    <p>{message}</p>
  </div>
);
