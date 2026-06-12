// @ts-nocheck
import React, { useState } from "react";

const RetroContact = () => {
  const [status, setStatus] = useState("");

  const handleClick = (type) => {
    setStatus(`> ${type}_protocol_initialized`);
  };

  return (
    <div>
      <div>&gt; establish_connection</div>
      <br />

      <div>Secure communication channel ready.</div>
      <div>Encryption: ENABLED</div>
      <div>System status: STABLE</div>

      <br />
      <div>------------------------------------------</div>
      <br />

      <div>
        EMAIL:{" "}
        <a
          href="mailto:carlosdepet@gmail.com"
          onClick={() => handleClick("email")}
        >
          carlosdepet@gmail.com
        </a>
      </div>

      <div>
        GITHUB:{" "}
        <a
          href="https://github.com/CXarlosss"
          target="_blank"
          rel="noreferrer"
          onClick={() => handleClick("github")}
        >
          github.com/CXarlosss
        </a>
      </div>

      <div>
        LINKEDIN:{" "}
        <a
          href="https://www.linkedin.com/in/carlos-de-petronila-rodriguez/"
          target="_blank"
          rel="noreferrer"
          onClick={() => handleClick("linkedin")}
        >
          linkedin.com/in/carlos-de-petronila-rodriguez
        </a>
      </div>

      <br />
      <div>------------------------------------------</div>
      <br />

      {status && <div>{status}</div>}

      <div>&gt; awaiting_response...</div>
    </div>
  );
};

export default RetroContact;
