import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import MainLayout from "../layouts/MainLayout";
import DimensionToggle from "../components/ui/DimensionToggle";
import { BsEnvelope, BsGithub, BsLinkedin, BsSend } from "react-icons/bs";
import styles from "./ContactPage.module.css";

const ContactPage = () => {
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <MainLayout>
      <div className={styles.contactWrapper}>
        <Container>
          <header className={styles.header}>
            <Row className="align-items-end mb-4">
              <Col md={8}>
                <span className={styles.preTitle}>GET_IN_TOUCH</span>
                <h1 className={styles.title}>Establish Connection</h1>
                <p className={styles.subtitle}>Open for collaborations, architectural consulting, and full-stack engineering opportunities.</p>
              </Col>
              <Col md={4} className="text-md-end">
                <DimensionToggle />
              </Col>
            </Row>
          </header>

          <Row className="g-5 mt-4">
            <Col lg={5}>
              <div className={styles.infoList}>
                <a href="mailto:carlosdepet@gmail.com" className={styles.infoItem}>
                  <BsEnvelope className={styles.icon} />
                  <div>
                    <span className={styles.label}>Direct Email</span>
                    <p>carlosdepet@gmail.com</p>
                  </div>
                </a>
                <a href="https://github.com/CXarlosss" target="_blank" rel="noreferrer" className={styles.infoItem}>
                  <BsGithub className={styles.icon} />
                  <div>
                    <span className={styles.label}>Engineering Hub</span>
                    <p>github.com/CXarlosss</p>
                  </div>
                </a>
                <a href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/" target="_blank" rel="noreferrer" className={styles.infoItem}>
                  <BsLinkedin className={styles.icon} />
                  <div>
                    <span className={styles.label}>Professional Network</span>
                    <p>linkedin.com/in/carlos-de-petronila</p>
                  </div>
                </a>
              </div>
            </Col>

            <Col lg={7}>
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <span>Secure Messaging Protocol</span>
                </div>
                <Form onSubmit={handleSubmit} className={styles.form}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Your Name" required className={styles.input} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="email@address.com" required className={styles.input} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-4">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control type="text" placeholder="Project Inquiry / Collaboration" className={styles.input} />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={5} placeholder="Describe your requirements..." required className={styles.input} />
                  </Form.Group>

                  <Button type="submit" className={styles.submitBtn} disabled={status !== "idle"}>
                    {status === "idle" && <><BsSend /> Send Message</>}
                    {status === "sending" && "Transmitting..."}
                    {status === "success" && "Message Received"}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
