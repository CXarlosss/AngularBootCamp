// @ts-nocheck
import React from 'react';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import styles from '../../styles/pages/ContactPage.module.css';

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      <div className={styles.contactPageContainer}>
        <h1 className={styles.pageTitle}>Contacto</h1> {/* opcional */}
        <div className={styles.contactGrid}>
          <section className={styles.pageForm}>
            <ContactForm />
          </section>
          <aside className={styles.pageInfo}>
            <ContactInfo />
          </aside>
        </div>
        {/* Bloque de mapa opcional */}
      {/*   <section className={styles.pageMap}>
          <div className={styles.mapCard}>
            <iframe ... />
          </div>
        </section> */}
      </div>
    </div>
  );
}