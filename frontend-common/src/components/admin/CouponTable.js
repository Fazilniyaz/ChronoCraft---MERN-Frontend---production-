import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";

export default function CouponTable() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  // Fetch coupons on component load
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await axios.get(
          "https://api.chronocrafts.xyz/api/v1/coupons",
          {
            withCredentials: true,
          }
        );
        setCoupons(data.coupons);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch coupons."
        );
      }
    };
    fetchCoupons();
  }, []);

  // Open modal for confirmation
  const openModal = (couponId) => {
    setSelectedCouponId(couponId);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCouponId(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `https://api.chronocrafts.xyz/api/v1/delete/${selectedCouponId}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Coupon deleted successfully.");
      setCoupons(coupons.filter((coupon) => coupon._id !== selectedCouponId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete coupon.");
    }
    closeModal();
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Manage Coupons</h2>
      <table className="table table-striped shadow bg-light">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount (%)</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.discount}</td>
                <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => openModal(coupon._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No coupons available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ fontSize: "1.1rem", color: "#333" }}>
            Are you sure you want to delete this coupon? This action cannot be
            undone.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
