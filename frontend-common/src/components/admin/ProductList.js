import { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import Loader from "../../components/layouts/Loader";
import { MDBDataTable } from "mdbreact";
import Sidebar from "./SideBar";
import {
  deleteProduct,
  disableProduct,
  enableProduct,
  getAdminProducts,
} from "../../actions/productActions";
import { clearProductDeleted } from "../../slices/productSlice";
import { clearError } from "../../slices/productsSlice";

export default function ProductList() {
  const {
    products = [],
    loading = true,
    error,
  } = useSelector((state) => state.productsState);
  const { isProductDeleted, error: productError } = useSelector(
    (state) => state.productState
  );
  const dispatch = useDispatch();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'delete' | 'disable' | 'enable'
  const [selectedProductId, setSelectedProductId] = useState(null);

  const openModal = (action, productId) => {
    setModalAction(action);
    setSelectedProductId(productId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalAction(null);
    setSelectedProductId(null);
  };

  const confirmAction = () => {
    if (modalAction === "delete") {
      dispatch(deleteProduct(selectedProductId));
    } else if (modalAction === "disable") {
      dispatch(disableProduct(selectedProductId));
    } else if (modalAction === "enable") {
      dispatch(enableProduct(selectedProductId));
    }
    closeModal();
  };

  const setProducts = () => {
    const data = {
      columns: [
        {
          label: "ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Name",
          field: "name",
          sort: "asc",
        },
        {
          label: "Price",
          field: "price",
          sort: "asc",
        },
        {
          label: "Stock",
          field: "stock",
          sort: "asc",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    products.forEach((product) => {
      data.rows.push({
        id: product._id,
        name: product.name,
        price: `$${product.price}`,
        stock: product.stock,
        actions: (
          <Fragment>
            <Link
              to={`/admin/product/${product._id}`}
              className="btn btn-primary"
              style={{ margin: "10px" }}
            >
              <i className="fa fa-pencil"></i>
            </Link>
            <Button
              onClick={() => openModal("delete", product._id)}
              className="btn btn-danger py-1 px-2 ml-2"
              style={{ margin: "10px" }}
            >
              <i className="fa fa-trash"></i>
            </Button>
            {product.disabled ? (
              <Button
                onClick={() => openModal("enable", product._id)}
                className="btn btn-success py-1 px-2 ml-2"
                style={{ margin: "10px auto" }}
              >
                Enable
              </Button>
            ) : (
              <Button
                onClick={() => openModal("disable", product._id)}
                className="btn btn-warning py-1 px-2 ml-2"
                style={{ margin: "10px" }}
              >
                Disable
              </Button>
            )}
          </Fragment>
        ),
      });
    });

    return data;
  };

  useEffect(() => {
    if (error || productError) {
      toast(error || productError, {
        position: "bottom-center",
        type: "error",
        onOpen: () => {
          dispatch(clearError());
        },
      });
      return;
    }

    if (isProductDeleted) {
      toast("Product Deleted Succesfully!", {
        type: "success",
        position: "bottom-center",
        onOpen: () => dispatch(clearProductDeleted()),
      });
      return;
    }

    dispatch(getAdminProducts);
  }, [dispatch, error, isProductDeleted]);

  // Modal content
  const getModalContent = () => {
    if (modalAction === "delete") {
      return {
        title: "Delete Product",
        body: "Are you sure you want to delete this product? This action cannot be undone.",
        confirmText: "Yes, Delete",
        confirmVariant: "danger",
      };
    } else if (modalAction === "disable") {
      return {
        title: "Disable Product",
        body: "Are you sure you want to disable this product? It will not be visible to customers.",
        confirmText: "Yes, Disable",
        confirmVariant: "warning",
      };
    } else if (modalAction === "enable") {
      return {
        title: "Enable Product",
        body: "Are you sure you want to enable this product? It will be visible to customers.",
        confirmText: "Yes, Enable",
        confirmVariant: "success",
      };
    }
    return {};
  };

  const modalContent = getModalContent();

  return (
    <div className="row">
      <div className="col-12 col-md-2">
        <Sidebar />
      </div>
      <div className="col-12 col-md-10">
        <h1 className="my-4 headings">Product List</h1>
        <Fragment>
          {loading ? (
            <Loader />
          ) : (
            <MDBDataTable
              data={setProducts()}
              bordered
              striped
              hover
              className="px-6"
            />
          )}
        </Fragment>
        <Modal
          show={showModal}
          onHide={closeModal}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>{modalContent.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ fontSize: "1.1rem", color: "#333" }}>
              {modalContent.body}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant={modalContent.confirmVariant}
              onClick={confirmAction}
            >
              {modalContent.confirmText}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
