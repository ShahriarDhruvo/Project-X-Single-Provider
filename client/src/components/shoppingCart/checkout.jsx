import React, { useContext, useEffect, useState, useRef } from "react";
import { Button, Table } from "react-bootstrap";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import moment from "moment-timezone";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CartContext } from "../../contexts/CartContext";
import { ThemeContext } from "../../contexts/ThemeContext";

import emoji from "react-easy-emoji";
import Infobar from "../generic/infobar";
import CustomAlert from "../generic/CustomAlert";

const Checkout = (props) => {
    const form = useRef(null);
    const { items, discount, totalPrice, clearItems } = useContext(CartContext);

    const [statusVariant] = useState("danger");
    const [addressess, setAddressess] = useState([]);
    const [newAddress, setNewAddress] = useState({});
    const [status, setStatus] = useState(undefined);

    // Themes
    const { isLightTheme, theme } = useContext(ThemeContext);
    const variant = isLightTheme ? "light" : "dark";
    const ui = isLightTheme ? theme.light.ui : theme.dark.ui;
    const type = isLightTheme ? theme.light.type : theme.dark.type;
    const link = isLightTheme ? theme.light.link : theme.dark.link;
    const syntax = isLightTheme ? theme.light.syntax : theme.dark.syntax;
    // const border = isLightTheme ? theme.light.border : theme.dark.border;
    const success = isLightTheme ? theme.light.success : theme.dark.success;

    useEffect(() => {
        const loadData = async () => {
            const API_URL = "/getCustomerAddress/";

            const object = {
                customerId: localStorage.getItem("userID"),
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(object),
            });
            // if (response.status === 401) handleLogOut();

            const data = await response.json();

            if (!response.ok) setStatus(data.detail);
            else setAddressess(data.address);
        };

        loadData();
    }, []);

    const handleSelect = (e) => {
        let tmp = {};
        addressess.map(
            (address) =>
                address.customer_add_id.toString() === e.target.value &&
                (tmp = address)
        );
        setNewAddress(tmp);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let API_URL = "/createCustomerAddress/";

        const loadData = async () => {
            const formData = new FormData(form.current);

            let object = {};
            formData.forEach(function (value, key) {
                object[key] = value;
            });
            object["userid"] = localStorage.getItem("userID");

            try {
                // Confirming Address
                let response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(object),
                });

                let data = await response.json();

                if (!response.ok) setStatus(data.message);
                else {
                    // Confirming Order
                    API_URL = "/createcustomerorder/";

                    let details = [];

                    items.map((item) =>
                        details.push({
                            price: item.price,
                            product_id: item.id,
                            qty: `${item.qty * item.count} ${item.unit}`,
                        })
                    );

                    var currentTime = new Date();
                    const convertTime = moment(currentTime)
                        .tz("America/Danmarkshavn")
                        .format("YYYY-MM-DD HH:mm:ss");
                    const today = new Date(convertTime);
                    // nothing here
                    const date =
                        today.getFullYear() +
                        "-" +
                        (today.getMonth() + 1) +
                        "-" +
                        today.getDate();
                    const time = today.getHours() + ":" + today.getMinutes();

                    object = {};
                    object["userid"] = localStorage.getItem("userID");
                    object["service_id"] = sessionStorage.getItem("service_id");
                    object["order_time"] = date + " " + time;
                    object["customer_address_id"] = data.customer_add_id;
                    object["payment"] = totalPrice;
                    object["details"] = details;

                    response = await fetch(API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(object),
                    });

                    data = await response.json();

                    if (!response.ok) setStatus(data.message);
                    else {
                        // setStatusVariant("success");
                        // setStatus(
                        //     "We have recieved your order successfully 😄"
                        // );
                        handleCleanUP(data.order_id);
                    }
                }
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
    };

    const handleCleanUP = (order_id) => {
        clearItems();
        sessionStorage.setItem("service_id", "");
        props.history.push(`/order/success/${order_id}`);
    };

    return (
        // <div className={"card" + ui + syntax + border}>
        <div className={"card" + ui + syntax}>
            <div className="card-body row">
                <div className="col-md-4 order-md-2 mb-4">
                    <h4 className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ opacity: "0.7" }}>Your cart</span>
                        <span className={"badge badge-pill badge-" + type}>
                            {items.length}
                        </span>
                    </h4>

                    {items.length > 0 ? (
                        <div
                            // className={"rounded mb-3" + border}
                            className={"rounded mb-3 muted_border"}
                            style={{ height: "15rem", overflowY: "scroll" }}
                        >
                            <Table responsive="sm" striped variant={variant}>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="align-middle">
                                                {item.productName}
                                                <br />
                                                <small
                                                    style={{
                                                        opacity: "0.7",
                                                    }}
                                                >
                                                    Item count: {item.count},
                                                    Per Item Price:{" "}
                                                    <span className="font-weight-bold">
                                                        ৳{" "}
                                                    </span>
                                                    {item.price}
                                                </small>
                                            </td>
                                            <td className="text-right align-middle">
                                                Tk {item.count * item.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="mb-3">
                            <Infobar>Your cart is empty {emoji("🙁")}</Infobar>
                        </div>
                    )}

                    <div className={"text-center mb-3" + link}>
                        <Link to="/cart">Back to shopping cart</Link>
                    </div>

                    {/* <div className={"rounded mb-3" + border}> */}
                    <div className={"rounded mb-3 muted_border"}>
                        <Table responsive="sm" striped variant={variant}>
                            <tbody>
                                <tr>
                                    <td
                                        className={
                                            "align-middle text-" + success
                                        }
                                    >
                                        <div>
                                            <h6 className="my-0">Discount</h6>
                                            <small>
                                                For Early Birds: {discount}%
                                            </small>
                                        </div>
                                    </td>
                                    <td className="text-right align-middle">
                                        Tk -
                                        {Math.floor(
                                            totalPrice * (discount / 100)
                                        )}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="align-middle">
                                        <span>Total (BDT)</span>
                                    </td>
                                    <td className="text-right align-middle">
                                        <strong>TK {totalPrice}</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    {/* <form className={"card p-2" + ui + border}> */}
                    <form className={"card p-2" + ui}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Promo code"
                                className="form-control"
                            />
                            <div className="input-group-append">
                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="col-md-8 order-md-1">
                    <h4 className="mb-3">Shipping address</h4>
                    <form
                        ref={form}
                        noValidate
                        onSubmit={handleSubmit}
                        className="needs-validation"
                    >
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="username">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "user"]}
                                    />
                                    Name
                                </label>
                                <input
                                    readOnly
                                    type="text"
                                    id="username"
                                    defaultValue={localStorage.getItem(
                                        "username"
                                    )}
                                    // className={
                                    //     "text-center form-control" + border
                                    // }
                                    className={
                                        "text-center form-control"
                                    }
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="phone">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "phone"]}
                                    />
                                    Phone
                                </label>
                                <input
                                    readOnly
                                    id="phone"
                                    type="phone"
                                    // className={
                                    //     "text-center form-control" + border
                                    // }
                                    className={
                                        "text-center form-control"
                                    }
                                    defaultValue={localStorage.getItem(
                                        "phone_number"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <small style={{ opacity: "0.7" }}>
                                Want them to call you to another number? Provide
                                it in the further description filed
                            </small>
                        </div>

                        <hr
                            className="mb-4"
                            style={{
                                borderColor: "inherit",
                                opacity: "0.2",
                            }}
                        />

                        <div className="row">
                            <div className="col mb-3">
                                <label htmlFor="address">Addresses</label>
                                <select
                                    required
                                    id="address"
                                    onChange={handleSelect}
                                    // className={
                                    //     "custom-select d-block w-100" + border
                                    // }
                                    className={
                                        "custom-select d-block w-100"
                                    }
                                >
                                    <option defaultValue="">
                                        Select from saved addresses...
                                    </option>
                                    {addressess.map((address) => (
                                        <option
                                            key={address.customer_add_id}
                                            value={address.customer_add_id}
                                        >
                                            House No: {address.house_no}, Road
                                            No: {address.road_no}, Further
                                            Description:{" "}
                                            {address.further_description
                                                ? address.further_description
                                                : "Null"}
                                            ,
                                        </option>
                                    ))}
                                </select>
                                <div className="invalid-feedback">
                                    Please select a valid address
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="house_no">House No</label>
                                <input
                                    required
                                    type="text"
                                    id="house_no"
                                    name="house_no"
                                    placeholder="8"
                                    defaultValue={newAddress.house_no}
                                    className={
                                        "form-control text-center"
                                    }
                                    // className={
                                    //     "form-control text-center" + border
                                    // }
                                />
                                <div className="invalid-feedback">
                                    Please select a valid house.
                                </div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="road_no">Road No</label>
                                <input
                                    required
                                    type="text"
                                    id="road_no"
                                    name="road_no"
                                    placeholder="2/B"
                                    defaultValue={newAddress.road_no}
                                    // className={
                                    //     "form-control text-center" + border
                                    // }
                                    className={
                                        "form-control text-center"
                                    }
                                />
                                <div className="invalid-feedback">
                                    Please provide a valid road number.
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="further_description">
                                Further Description
                            </label>
                            <input
                                required
                                type="text"
                                id="further_description"
                                name="further_description"
                                defaultValue={newAddress.further_description}
                                placeholder="Sector-17, Uttara, Dhaka, Phone: 012xx-xxx-xxx"
                                // className={"form-control" + border}
                                className={"form-control"}
                            />
                            <div className="invalid-feedback">
                                Please enter your shipping further description.
                            </div>
                        </div>

                        <h4 className="mb-3">Payment</h4>

                        <div className="d-block my-3">
                            <div className="custom-control custom-radio">
                                <input
                                    disabled
                                    id="bkash"
                                    type="radio"
                                    name="paymentMethod"
                                    className="custom-control-input"
                                />
                                <label
                                    htmlFor="bkash"
                                    className="custom-control-label"
                                >
                                    Bkash
                                </label>
                            </div>

                            <div className="custom-control custom-radio">
                                <input
                                    required
                                    type="radio"
                                    defaultChecked
                                    id="cashOnDelivery"
                                    className="custom-control-input"
                                />
                                <label
                                    htmlFor="cashOnDelivery"
                                    className="custom-control-label"
                                >
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "hand-holding-usd"]}
                                    />
                                    Cash on delivery
                                </label>
                            </div>
                        </div>

                        <hr
                            className="mb-4"
                            style={{
                                borderColor: "inherit",
                                opacity: "0.2",
                            }}
                        />

                        {status && (
                            <CustomAlert
                                variant={statusVariant}
                                status={status}
                            />
                        )}

                        <div className="row mt-3">
                            <div className="col-sm-12 mb-2 col-md-6">
                                <Button
                                    to="/"
                                    as={Link}
                                    variant={"outline-" + type}
                                    className="w-100"
                                    disabled={
                                        items.length &&
                                        !(statusVariant === "success")
                                    }
                                >
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "home"]}
                                    />
                                    Back To Home Page
                                </Button>
                            </div>
                            <div className="col-sm-12 col-md-6 mb-2 text-right">
                                <Button
                                    type="submit"
                                    variant={type}
                                    className="w-100"
                                    disabled={
                                        !items.length ||
                                        statusVariant === "success"
                                    }
                                >
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "check-circle"]}
                                    />
                                    Confirm Purchase
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default withRouter(Checkout);
