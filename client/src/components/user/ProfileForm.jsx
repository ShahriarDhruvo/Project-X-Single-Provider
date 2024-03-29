import React, { useEffect, useRef, useState, useContext } from "react";
import { Button, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import CustomAlert from "../generic/CustomAlert";
import { AuthenticationContext } from "../../contexts/AuthenticationContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ThemeContext } from "../../contexts/ThemeContext";
import { SettingsContext } from "../../contexts/SettingsContext";

const ProfileForm = () => {
    const [user, setUser] = useState({});
    const [flag, setFlag] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [status, setStatus] = useState(undefined);
    const [variant, setVariant] = useState("danger");
    const [isServiceProvider] = useState(
        localStorage.getItem("isServiceProvider") === "true"
    );

    const form = useRef(null);

    const { handleLogOut } = useContext(AuthenticationContext);
    const { updateUniversalFlag } = useContext(SettingsContext);

    // Themes
    const { isLightTheme, theme } = useContext(ThemeContext);
    const ui = isLightTheme ? theme.light.ui : theme.dark.ui;
    const type = isLightTheme ? theme.light.type : theme.dark.type;
    const syntax = isLightTheme ? theme.light.syntax : theme.dark.syntax;
    // const border = isLightTheme ? theme.light.border : theme.dark.border;

    useEffect(() => {
        const loadData = async () => {
            const API_URL = isServiceProvider
                ? "/getProfile/"
                : "/customerprofile/";

            const object = {
                userid: localStorage.getItem("userID"),
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
            else setUser({ ...data });
        };

        loadData();
    }, [isServiceProvider, flag]);

    const handleEdit = () => {
        setStatus("");
        setCanEdit(!canEdit);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const API_URL = isServiceProvider
            ? "/updateProfile/"
            : "/customerUpdateProfile/";

        const loadData = async () => {
            const formData = new FormData(form.current);
            let object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            object["userid"] = localStorage.getItem("userID");
            object["username"] =
                object["username"].charAt(0).toUpperCase() +
                object["username"].slice(1);

            try {
                const response = await fetch(API_URL, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(object),
                });

                const data = await response.json();

                if (!response.ok) setStatus(data.message);
                else {
                    setVariant("success");
                    setStatus("Profile updated successfully");
                    localStorage.setItem("username", object.username);
                    updateFlag();
                    updateUniversalFlag();
                }
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
        setCanEdit(!canEdit);
    };

    const updateFlag = () => setFlag(!flag);

    return (
        <div
            // className={"card mx-auto" + ui + syntax + border}
            className={"card mx-auto" + ui + syntax}
            style={{ maxWidth: "38rem" }}
        >
            <article className="card-body">
                <h3 className="text-center mb-4">
                    {user.username && user.username + "'s"} Profile
                </h3>
                <form ref={form} onSubmit={handleSubmit} className="mx-auto">
                    {status && (
                        <CustomAlert variant={variant} status={status} />
                    )}

                    <Row className="form-group">
                        <Col className="my-auto">
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={["fas", "user"]}
                            />
                            Username:
                        </Col>
                        <Col md={8} sm={12}>
                            {/* <div className={"input-group rounded" + border}> */}
                            <div className={"input-group rounded"}>
                                <input
                                    type="text"
                                    name="username"
                                    readOnly={!canEdit}
                                    defaultValue={user.username}
                                    className="form-control text-center"
                                />
                            </div>
                        </Col>
                    </Row>

                    <Row className="form-group">
                        <Col className="my-auto">
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={["fas", "phone"]}
                            />
                            Phone:
                        </Col>
                        <Col md={8} sm={12}>
                            {/* <div className={"input-group rounded" + border}> */}
                            <div className={"input-group rounded"}>
                                <input
                                    readOnly
                                    type="number"
                                    name="userphone"
                                    defaultValue={user.userphone}
                                    className="form-control text-center"
                                />
                            </div>
                        </Col>
                    </Row>

                    {isServiceProvider && (
                        <>
                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "building"]}
                                    />
                                    Company:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="company_name"
                                            readOnly={!canEdit}
                                            defaultValue={user.company_name}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "hand-holding-usd"]}
                                    />
                                    Delivery Charge:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="number"
                                            readOnly={!canEdit}
                                            name="delivery_charge"
                                            defaultValue={user.delivery_charge}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "plus"]}
                                    />
                                    Description:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="description"
                                            readOnly={!canEdit}
                                            defaultValue={user.description}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "id-card"]}
                                    />
                                    NID:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            name="nid"
                                            type="text"
                                            readOnly={!canEdit}
                                            defaultValue={user.nid}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "taxi"]}
                                    />
                                    Service type:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="service_type"
                                            readOnly={!canEdit}
                                            defaultValue={user.service_type}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "id-card"]}
                                    />
                                    Trade license:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="trade_license"
                                            readOnly={!canEdit}
                                            defaultValue={user.trade_license}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row className="form-group">
                                <Col className="my-auto">
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "location-arrow"]}
                                    />
                                    Address:
                                </Col>
                                <Col md={8} sm={12}>
                                    <div
                                        // className={
                                        //     "input-group rounded" + border
                                        // }
                                        className={
                                            "input-group rounded"
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="address"
                                            readOnly={!canEdit}
                                            defaultValue={user.address}
                                            className="form-control text-center"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}

                    <div className="row mt-3">
                        <div
                            className={
                                canEdit
                                    ? "col-sm-12 mb-2 col-md-4"
                                    : "col-sm-12 mb-2 col-md-6"
                            }
                        >
                            <Button
                                className="w-100"
                                onClick={handleLogOut}
                                variant={"outline-" + type}
                            >
                                <FontAwesomeIcon
                                    className="mr-2"
                                    icon={["fas", "sign-out-alt"]}
                                />
                                Logout
                            </Button>
                        </div>

                        {canEdit && (
                            <div
                                className={
                                    canEdit
                                        ? "col-sm-12 mb-2 col-md-4"
                                        : "col-sm-12 mb-2 col-md-6"
                                }
                            >
                                <Button
                                    variant="remove"
                                    className="w-100"
                                    onClick={handleEdit}
                                >
                                    <FontAwesomeIcon
                                        className="mr-2"
                                        icon={["fas", "strikethrough"]}
                                    />
                                    Cancel Edit
                                </Button>
                            </div>
                        )}

                        <div
                            className={
                                canEdit
                                    ? "col-sm-12 mb-2 col-md-4"
                                    : "col-sm-12 mb-2 col-md-6"
                            }
                        >
                            <Button
                                variant={type}
                                className="w-100"
                                onClick={canEdit ? handleSubmit : handleEdit}
                            >
                                <FontAwesomeIcon
                                    className="mr-2"
                                    icon={["fas", canEdit ? "wrench" : "edit"]}
                                />
                                {canEdit ? "Update Profile" : "Edit Profile"}
                            </Button>
                        </div>
                    </div>
                </form>
            </article>
        </div>
    );
};

export default ProfileForm;
