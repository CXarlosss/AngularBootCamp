// @ts-nocheck
import ModernSection from "../global/ModernSection";
import ModernContainer from "../components/ModernContainer";
import ModernCard from "../components/ModernCard";
import ModernButton from "../components/ModernButton";
import styles from "./modern.contact.module.css";

export default function ModernContact() {
  return (
    <main>
      {/* HERO */}
      <ModernSection size="large">
        <ModernContainer size="narrow">
          <div className={styles["modern-contact-hero"]}>
            <span className={styles["modern-contact-eyebrow"]}>CONTACTO</span>

            <h1 className={styles["modern-contact-title"]}>
              Hablemos de tu
              <br />
              próximo proyecto.
            </h1>

            <p className={styles["modern-contact-subtitle"]}>
              Desarrollo productos digitales escalables. Si tienes una idea
              ambiciosa, estoy listo para construirla.
            </p>
          </div>
        </ModernContainer>
      </ModernSection>

      {/* MAIN BLOCK */}
      <ModernSection>
        <ModernContainer size="wide">
          <div className={styles["modern-contact-grid"]}>
            {/* LEFT SIDE */}
            <div className={styles["modern-contact-info"]}>
              <div className={styles["modern-contact-block"]}>
                <h3>Contacto directo</h3>
                <p>
                  Puedes escribirme directamente o completar el formulario.
                  Respondo en menos de 24 horas.
                </p>
              </div>

              <div className={styles["modern-contact-links"]}>
                <a
                  href="mailto:carlosdepet@gmail.com"
                  className={styles["modern-contact-link"]}
                >
                  <span>Email</span>
                  <strong>carlosdepet@gmail.com</strong>
                </a>

                <a
                  href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["modern-contact-link"]}
                >
                  <span>LinkedIn</span>
                  <strong>/carlos-de-petronila-rodriguez</strong>
                </a>

                <a
                  href="https://github.com/CXarlosss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["modern-contact-link"]}
                >
                  <span>GitHub</span>
                  <strong>@CXarlosss</strong>
                </a>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className={styles["modern-contact-form-wrapper"]}>
              <ModernCard padding="lg">
                <form
                  className={styles["modern-contact-form"]}
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input type="text" placeholder="Nombre" required />

                  <input type="email" placeholder="Email" required />

                  <textarea
                    placeholder="Cuéntame sobre tu proyecto..."
                    rows="5"
                    required
                  />

                  <ModernButton fullWidth>Enviar mensaje →</ModernButton>
                </form>
              </ModernCard>
            </div>
          </div>
        </ModernContainer>
      </ModernSection>
    </main>
  );
}
