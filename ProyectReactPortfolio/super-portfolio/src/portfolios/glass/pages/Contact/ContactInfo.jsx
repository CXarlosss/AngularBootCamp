// @ts-nocheck
import React from 'react';
import styles from '../../styles/components/contact/contactInfo.module.css';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function ContactInfo() {
  return (
    <section className={styles.contactInfo} aria-labelledby="contact-title">
      <h2 id="contact-title" className={styles.title}>Mi información de contacto</h2>

      <dl className={styles.list}>
        <div className={styles.item}>
          <FaEnvelope aria-hidden="true" className={styles.icon} />
          <dt className={styles.term}>Email</dt>
          <dd className={styles.desc}>
            <a href="mailto:carlosdepet@gmail.com">carlosdepet@gmail.com</a>
          </dd>
        </div>

        <div className={styles.item}>
          <FaPhone aria-hidden="true" className={styles.icon} />
          <dt className={styles.term}>Teléfono</dt>
          <dd className={styles.desc}>
            <a href="tel:+34628192253" rel="nofollow">+34&nbsp;628&nbsp;19&nbsp;22&nbsp;53</a>
          </dd>
        </div>

        <div className={styles.item}>
          <FaLinkedin aria-hidden="true" className={styles.icon} />
          <dt className={styles.term}>LinkedIn</dt>
          <dd className={styles.desc}>
            <a
              href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
              target="_blank"
              rel="noopener noreferrer"
            >
              /carlos-de-petronila-rodriguez
            </a>
          </dd>
        </div>

        <div className={styles.item}>
          <FaGithub aria-hidden="true" className={styles.icon} />
          <dt className={styles.term}>GitHub</dt>
          <dd className={styles.desc}>
            <a
              href="https://github.com/CXarlosss"
              target="_blank"
              rel="noopener noreferrer"
            >
              @CXarlosss
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
