import Moment from "moment";
import PropTypes from "prop-types";
import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import emoji from "react-easy-emoji";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { AppBar, Tabs, Tab, Box } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ThemeContext } from "../../contexts/ThemeContext";

import Infobar from "../generic/infobar";
import SearchBar from "../generic/SearchBar";
import CustomTable from "../generic/CustomTable";
import EmployeeDropDown from "../employees/EmployeeDropDown";
import CustomModalAlert from "../generic/CustomModalAlert";
import DeleteModal from "../generic/DeleteModal";

const Order = (props) => {
    const [value, setValue] = useState(0);
    const [flag, setFlag] = useState(true);
    const [orders, setOrders] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [status, setStatus] = useState(undefined);
    const [searchData, setSearchData] = useState("");
    const [tabs] = useState(["Not Assigned", "Assigned"]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [statusVariant, setStatusVariant] = useState(undefined);
    const [selectedEmployeeID, setSelectedEmployeeID] = useState({}); // {27: 17, 28: 2, 32: 28.........}
    const [selectedEmployeeName, setSelectedEmployeeName] = useState({}); // {27: "Toha", 28: "Dhruvo", 32: "lkbnefj".........}

    // Themes
    const { isLightTheme, theme } = useContext(ThemeContext);
    const ui = isLightTheme ? theme.light.ui : theme.dark.ui;
    const type = isLightTheme ? theme.light.type : theme.dark.type;
    const link = isLightTheme ? theme.light.link : theme.dark.link;
    const syntax = isLightTheme ? theme.light.syntax : theme.dark.syntax;
    const success = isLightTheme ? theme.light.success : theme.dark.success;
    const dangerTextColor = isLightTheme
        ? theme.light.dangerTextColor
        : theme.dark.dangerTextColor;
    const mainColor = isLightTheme
        ? theme.light.mainColor
        : theme.dark.mainColor;
    const custom_text = isLightTheme
        ? theme.light.custom_text
        : theme.dark.custom_text;

    // componentDidMount
    useEffect(() => {
        let API_URL = "/getserviceorders/";

        const loadData = async () => {
            let bodyData = {
                search_data: searchData,
                userid: localStorage.getItem("userID"),
            };

            let response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            let data = await response.json();

            if (!response.ok) setStatus(data.message);
            else setOrders(data.details);

            // Get employee's list
            API_URL = "/getEmployee/";

            bodyData = {
                search_data: searchData,
                service_id: localStorage.getItem("userID"),
            };

            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            data = await response.json();

            if (!response.ok) setStatus(data.message);
            else setEmployes(data.employee);

            // Get assigned employee
            API_URL = "/getassignedserviceorders/";

            bodyData = {
                search_data: searchData,
                userid: localStorage.getItem("userID"),
            };

            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });

            data = await response.json();

            if (!response.ok) setStatus(data.message);
            else setAssignedOrders(data.details);
        };
        loadData();
    }, [flag, searchData]);

    const handleOrderComplete = (order_id) => {
        const API_URL = "/completeserviceorder/";

        const loadData = async () => {
            const orderID = {
                order_id: order_id,
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderID),
            });

            const data = await response.json();

            if (response.ok) {
                // !alert(
                //     `Order Id: ${order_id} has been completed successfully`
                // ) && setFlag(!flag);
                setFlag(!flag);
                setStatus(data.message);
                setStatusVariant("success");
            } else {
                setStatusVariant("danger");
                setStatus(data.message);
            }
        };
        loadData();
    };

    const handleAssignComplete = (order_id) => {
        const API_URL = "/assignEmployee/";

        const loadData = async () => {
            const body = {
                order_id: order_id,
                employee_id: selectedEmployeeID[order_id],
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                // !alert(
                //     `Employee ${selectedEmployeeName[order_id]} has been assigned successfully for Order Id: ${order_id}`
                // ) && setFlag(!flag);
                setFlag(!flag);
                setStatus(data.message);
                setStatusVariant("success");
            } else {
                setStatusVariant("danger");
                setStatus(data.message);
            }
        };
        loadData();
    };

    const handleEmployeeSelect = (e, id) => {
        setSelectedEmployeeID({ ...selectedEmployeeID, [id]: e.id });
        setSelectedEmployeeName({ ...selectedEmployeeName, [id]: e.name });
    };

    const handleCancel = async (order_id) => {
        const API_URL = "/cancel/service/order/";

        const bodyData = {
            order_id: order_id,
            userid: localStorage.getItem("userID"),
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
        });

        const data = await response.json();

        if (response.ok) {
            setStatusVariant("success");
            setStatus(data.message);
        } else {
            setStatusVariant("danger");
            setStatus(data.message);
        }
    };

    const handleSearchChange = (e) => setSearchData(e.target.value);

    // Tab related settings.....
    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`scrollable-auto-tabpanel-${index}`}
                aria-labelledby={`scrollable-auto-tab-${index}`}
                {...other}
            >
                {value === index && <Box>{children}</Box>}
            </div>
        );
    };

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired,
    };

    const a11yProps = (index) => {
        return {
            id: `scrollable-auto-tab-${index}`,
            "aria-controls": `scrollable-auto-tabpanel-${index}`,
        };
    };

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const tableData = {
        ths: [
            { className: "", value: "Order ID" },
            { className: "", value: "Customer Details" },
            { className: "", value: "Address" },
            {
                className: "",
                value: "Further Description",
            },
            { className: "", value: "Payment" },
            { className: "", value: "Time" },
            {
                className: "",
                value: "Employee",
                // value: index === 0 ? "Select Employee" : "Employee",
            },
            { className: "", value: "Action" },
            { className: "", value: "Cancel" },
        ],
        tdsClassName: ["", "", "text-break", ""],
        allowedEntry: ["customer_name", "address", "further_description"],
    };

    return (
        <>
            <h4 className={"mb-5 text-center" + syntax}>Your Orders</h4>

            <SearchBar
                handleChange={handleSearchChange}
                placeholder="Search orders...."
                searchBy={<>Search by anything except time and cancelled by</>}
            />

            <AppBar elevation={0} position="static" className={"rounded muted_border" + ui}>
                <Tabs
                    value={value}
                    variant="fullWidth"
                    className={custom_text}
                    onChange={handleChange}
                    TabIndicatorProps={{ style: { background: mainColor } }}
                >
                    {tabs.map((tab) => (
                        <Tab
                            label={
                                tab === "Not Assigned" ? (
                                    <div>
                                        {tab}{" "}
                                        <span
                                            className={
                                                "badge badge-pill badge-" + type
                                            }
                                        >
                                            {orders ? orders.length : 0}
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        {tab}{" "}
                                        <span
                                            className={
                                                "badge badge-pill badge-" + type
                                            }
                                        >
                                            {assignedOrders
                                                ? assignedOrders.length
                                                : 0}
                                        </span>
                                    </div>
                                )
                            }
                            key={uuidv4()}
                            {...a11yProps(uuidv4())}
                            style={{ textTransform: "none" }}
                        />
                    ))}
                </Tabs>
            </AppBar>

            {tabs.map((tab, index) => (
                <TabPanel
                    key={uuidv4()}
                    value={value}
                    index={index}
                    className="pt-4"
                >
                    {status && (
                        <CustomModalAlert
                            status={status}
                            setStatus={setStatus}
                            variant={statusVariant}
                        />
                    )}

                    {(index === 0 ? orders : assignedOrders) ? (
                        <CustomTable
                            ths={tableData.ths}
                            allowedEntry={tableData.allowedEntry}
                            PreActionComponents={[
                                {
                                    component: (order) => (
                                        <Link
                                            to={`/order/details/${order.order_id}/`}
                                        >
                                            {order.order_id}
                                        </Link>
                                    ),
                                    className: link,
                                },
                            ]}
                            tdsClassName={tableData.tdsClassName}
                            datas={index === 0 ? orders : assignedOrders}
                            ActionComponents={[
                                {
                                    component: (order) => (
                                        <>
                                            <span className="font-weight-bold">
                                                ৳{" "}
                                            </span>
                                            {order.payment}
                                        </>
                                    ),
                                    className: "",
                                },
                                {
                                    component: (order) =>
                                        Moment(order.time).format(
                                            "DD/MM/YY hh:mmA"
                                        ),
                                    className: "",
                                },
                                {
                                    component: (order) =>
                                        index === 0 ? (
                                            <EmployeeDropDown
                                                size="sm"
                                                type={
                                                    selectedEmployeeName[
                                                        order.order_id
                                                    ]
                                                        ? type
                                                        : "outline-" + type
                                                }
                                                subElementKey="employee_id"
                                                subElementValue="employee_name"
                                                values={
                                                    employes ? employes : []
                                                }
                                                title={
                                                    selectedEmployeeName[
                                                        order.order_id
                                                    ]
                                                        ? selectedEmployeeName[
                                                              order.order_id
                                                          ]
                                                        : "Assign"
                                                }
                                                handleSelect={(e) =>
                                                    handleEmployeeSelect(
                                                        e,
                                                        order.order_id
                                                    )
                                                }
                                            />
                                        ) : (
                                            order.employee
                                        ),
                                    className: "",
                                },
                                {
                                    component: (order) => (
                                        <Button
                                            size="sm"
                                            variant={success}
                                            disabled={
                                                selectedEmployeeName[
                                                    order.order_id
                                                ]
                                                    ? false
                                                    : index === 0
                                            }
                                            onClick={() =>
                                                index === 0
                                                    ? handleAssignComplete(
                                                          order.order_id
                                                      )
                                                    : handleOrderComplete(
                                                          order.order_id
                                                      )
                                            }
                                        >
                                            {index === 0 ? (
                                                <FontAwesomeIcon
                                                    icon={["fas", "user-check"]}
                                                />
                                            ) : (
                                                <FontAwesomeIcon
                                                    icon={["fas", "check"]}
                                                />
                                            )}
                                        </Button>
                                    ),
                                    className: "",
                                },
                                {
                                    component: (order) => (
                                        <DeleteModal
                                            // deleteText="Cancel"
                                            deleteTitle="Cancel Order"
                                            updateFlag={() => setFlag(!flag)}
                                            handleAction={() =>
                                                handleCancel(order.order_id)
                                            }
                                            deleteIcon="ban"
                                            modalBody={
                                                <>
                                                    Do you really want to cancel
                                                    this order?{" "}
                                                    <span
                                                        className={
                                                            dangerTextColor
                                                        }
                                                    >
                                                        Caution: This action
                                                        cannot be undone
                                                    </span>
                                                </>
                                            }
                                        />
                                    ),
                                    className: "",
                                },
                            ]}
                        />
                    ) : index === 0 ? (
                        <Infobar>
                            You have no orders to show {emoji("🥲")}
                        </Infobar>
                    ) : (
                        <Infobar>
                            You haven't assigned any orders yet! {emoji("🙁")}
                        </Infobar>
                    )}
                </TabPanel>
            ))}
        </>
    );
};

export default Order;
