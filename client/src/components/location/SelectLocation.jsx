import React, { useState, useContext, useEffect } from "react";

import { ThemeContext } from "../../contexts/ThemeContext";
import { LocationContext } from "../../contexts/LocationContext";

import CustomAlert from "../generic/CustomAlert";
import LocationDropDown from "./LocationDropDown";

const SelectLocation = () => {
    const [areas, setAreas] = useState([]);
    const [thanas, setThanas] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(
        JSON.parse(sessionStorage.getItem("location"))
            ? JSON.parse(sessionStorage.getItem("location"))
            : {
                  area: "",
                  thana: "",
                  district: "",
              }
    );
    const [status, setStatus] = useState(undefined);

    const { changeLocation } = useContext(LocationContext);

    // Themes
    const { isLightTheme, theme } = useContext(ThemeContext);
    const syntax = isLightTheme ? theme.light.syntax : theme.dark.syntax;

    // ComponentDidMount
    useEffect(() => {
        // Setting previously selected location from sessionStorage
        const json = sessionStorage.getItem("location");
        const localLocation = JSON.parse(json);

        if (localLocation) {
            // For refreshed page data
            const loadData = async () => {
                let API_URL = "/getThana/";

                let bodyData = {
                    district: localLocation.district,
                };

                try {
                    // Getting Thanas
                    let response = await fetch(API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(bodyData),
                    });

                    let data = await response.json();

                    if (!response.ok) setStatus(data.message);

                    setThanas(data.details);

                    // Getting Areas
                    API_URL = "/getArea/";

                    bodyData = {
                        thana: localLocation.thana,
                        district: localLocation.district,
                    };

                    response = await fetch(API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(bodyData),
                    });

                    data = await response.json();

                    if (!response.ok) setStatus(data.message);

                    setAreas(data.details);
                } catch (error) {
                    setStatus(error);
                }
            };

            loadData();
        }

        const loadData = async () => {
            const API_URL = "/getDistrict/";

            try {
                const response = await fetch(API_URL, {
                    method: "GET",
                });

                const data = await response.json();

                if (!response.ok) setStatus(data.message);

                setDistricts(data.details);
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
    }, []);

    const handleDistrictSelect = (e) => {
        setSelectedLocation({
            area: "",
            thana: "",
            district: e,
        });

        const loadData = async () => {
            const API_URL = "/getThana/";

            const bodyData = {
                district: e,
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

                setThanas(data.details);
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
    };

    const handleThanaSelect = (e) => {
        setSelectedLocation({ ...selectedLocation, area: "", thana: e });

        const loadData = async () => {
            const API_URL = "/getArea/";

            const bodyData = {
                thana: e,
                district: selectedLocation.district,
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

                setAreas(data.details);
            } catch (error) {
                setStatus(error);
            }
        };

        loadData();
    };

    const handleAreaSelect = (e) => {
        setSelectedLocation({ ...selectedLocation, area: e });
        changeLocation({ ...selectedLocation, area: e });
    };

    return (
        <div>
            <div className={"text-center mt-2" + syntax}>
                <h2>
                    Why bother, when <span className="logo-text">ProjectX</span>{" "}
                    is here!
                </h2>
            </div>

            {status && <CustomAlert status={status} />}

            <div className="row mt-5">
                <div className="col-sm-12 col-lg-4">
                    <LocationDropDown
                        size="lg"
                        status=""
                        customClass="mb-2 w-100"
                        values={districts ? districts : []}
                        handleSelect={handleDistrictSelect}
                        title={
                            selectedLocation && selectedLocation.district
                                ? selectedLocation.district
                                : "District"
                        }
                    />
                </div>

                <div className="col-sm-12 col-lg-4">
                    <LocationDropDown
                        size="lg"
                        customClass="mb-2 w-100"
                        values={thanas ? thanas : []}
                        status={!selectedLocation.district}
                        handleSelect={handleThanaSelect}
                        title={
                            selectedLocation && selectedLocation.thana
                                ? selectedLocation.thana
                                : "Thana"
                        }
                    />
                </div>

                <div className="col-sm-12 col-lg-4">
                    <LocationDropDown
                        size="lg"
                        customClass="mb-2 w-100"
                        values={areas ? areas : []}
                        status={!selectedLocation.thana}
                        handleSelect={handleAreaSelect}
                        title={
                            selectedLocation && selectedLocation.area !== ""
                                ? selectedLocation.area
                                : "Area"
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default SelectLocation;
