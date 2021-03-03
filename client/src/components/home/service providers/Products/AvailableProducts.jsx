import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import Title from "../../../generic/title";
import emoji from "react-easy-emoji";

import Infobar from "../../../generic/infobar";
import AddProduct from "./AddProduct";
import CustomCard from "../../../generic/CustomCard";

const AvailableProducts = (props) => {
    const [flag, setFlag] = useState(true);
    const [status, setStatus] = useState(undefined);
    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => {
        const API_URL = "/availableProduct/";

        const loadData = async () => {
            const bodyData = {
                service_id: localStorage.getItem("userID"),
            };

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bodyData),
                });

                const data = await response.json();

                if (!response.ok) setStatus(data.message);

                setAvailableProducts(data.items);
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
    }, [flag]);

    const updateFlag = () => setFlag(!flag);

    return (
        <>
            <div className="mb-4">
                <Infobar>Available Products</Infobar>
            </div>

            <CustomCard
                status={status}
                setStatus={setStatus}
                values={availableProducts}
                cardBodyData={(availableProduct) => (
                    <>
                        <Card.Title>{availableProduct.product_name}</Card.Title>

                        <div>
                            <Title>Vat: </Title> {availableProduct.vat}%
                            <br />
                            <Title>Quantity: </Title> {availableProduct.qty}{" "}
                            {availableProduct.unit}
                            <br />
                            <Title>Company: </Title>{" "}
                            {availableProduct.company_name}
                        </div>

                        <AddProduct
                            updateFlag={updateFlag}
                            availableProduct={availableProduct}
                            product_name={availableProduct.product_name}
                        />
                    </>
                )}
                noValueInfo={
                    <>
                        No new products to show to add to your inventory{" "}
                        {emoji("☹")}
                    </>
                }
            />
        </>
    );
};

export default AvailableProducts;