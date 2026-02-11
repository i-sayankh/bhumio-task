import React, { useState, useRef } from "react";

const MAX_RETRIES = 3;

function mockApi(requestId, payload) {
  return new Promise((resolve, reject) => {
    const random = Math.random();

    // 33% immediate success
    if (random < 0.33) {
      setTimeout(() => {
        resolve({ status: 200, data: { requestId, ...payload } });
      }, 1000);
    }

    // 33% temporary failure
    else if (random < 0.66) {
      setTimeout(() => {
        reject({ status: 503, message: "Temporary failure" });
      }, 1000);
    }

    // 33% delayed success
    else {
      const delay = 5000 + Math.random() * 5000;
      setTimeout(() => {
        resolve({ status: 200, data: { requestId, ...payload } });
      }, delay);
    }
  });
}

export default function App() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [records, setRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmittingRef = useRef(false);
  const requestIdRef = useRef(null);
  const retriesRef = useRef(0);

  const submitWithRetry = async (requestId, payload) => {
    try {
      const response = await mockApi(requestId, payload);

      if (response.status === 200) {
        // Deduplicate using requestId
        setRecords(prev => {
          const exists = prev.find(r => r.requestId === requestId);
          if (exists) return prev;
          return [...prev, response.data];
        });

        setStatus("success");
        setMessage("Submission successful");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error.status === 503 && retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setStatus("retrying");
        setMessage(`Retrying... (${retriesRef.current})`);
        submitWithRetry(requestId, payload);
      } else {
        setStatus("error");
        setMessage("Failed after retries");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    retriesRef.current = 0;

    const requestId = crypto.randomUUID();
    requestIdRef.current = requestId;

    const payload = { email, amount };

    setStatus("pending");
    setMessage("Submitting...");

    submitWithRetry(requestId, payload);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h2>Payment Form</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            required
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <strong>Status:</strong> {status}
        <div>{message}</div>
      </div>

      <hr />

      <h3>Submitted Records</h3>
      <ul>
        {records.map((r) => (
          <li key={r.requestId}>
            {r.email} - {r.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
