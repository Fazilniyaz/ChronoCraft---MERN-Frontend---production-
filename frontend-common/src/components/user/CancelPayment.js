import React from "react";
import { Link } from "react-router-dom";

const CancelPayment = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f8d7da",
    },
    card: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
      maxWidth: "400px",
    },
    heading: {
      color: "#dc3545",
      marginBottom: "10px",
    },
    message: {
      color: "#6c757d",
      fontSize: "16px",
      marginBottom: "15px",
    },
    image: {
      width: "80px",
      marginBottom: "15px",
    },
    button: {
      backgroundColor: "#007bff",
      color: "#fff",
      padding: "10px 15px",
      textDecoration: "none",
      borderRadius: "5px",
      display: "inline-block",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Payment Cancelled</h2>
        <p style={styles.message}>
          Your payment has been cancelled. If this was a mistake, please try
          again.
        </p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/1828/1828843.png"
          alt="Cancelled"
          style={styles.image}
        />
        <Link to="/" style={styles.button}>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default CancelPayment;
