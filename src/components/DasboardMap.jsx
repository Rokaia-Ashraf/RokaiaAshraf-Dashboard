import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Featurelayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import * as geometryEngineAsync from "@arcgis/core/geometry/geometryEngineAsync";

import StateEnrollments from "./StateEnrollments";
import CityEnrollments from "./CityEnrollments";
import StateSchools from "./StateSchools";
import CitySchools from "./CitySchools";

const DasboardMap = () => {
  const myMapRef = useRef(null);
  const [allStates, setAllStates] = useState();
  const [totalEnrollmentByState, setTotalEnrollmentByState] = useState();
  const [totalSchoolsByState, setTotalSchoolsByState] = useState();

  const [allCities, setAllCities] = useState();
  const [totalEnrollmentByCity, setTotalEnrollmentByCity] = useState();
  const [totalSchoolsByCity, setTotalSchoolsByCity] = useState();

  useEffect(() => {
    (async () => {
      let groupFieldState = "STATE";
      let groupFieldCity = "CITY";
      let totalEnrollmentField = "TOT_ENROLL";
      let schoolsField = "NAME";

      const myLayer = new Featurelayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/CollegesUniversities/FeatureServer/0",
        outFields: ["*"],
        blendMode: "",
        effect: "drop-shadow(1px, 0px, 0px)",
        title: "Schools",
      });

      const map = new Map({
        basemap: "gray-vector",
        layers: [myLayer],
      });
      const view = new MapView({
        container: myMapRef.current,
        map: map,
        scale: 73957191,
        center: [-100, 38],
        constraints: {
          minScale: 739571900,
        },
      });

      view.whenLayerView(myLayer).then(() => {
        let States;
        let Cities;
        const totalEnrollmentsQuery = async () => {
          const consumeEnrollment = {
            onStatisticField: totalEnrollmentField,
            outStatisticFieldName: "TOT_ENROLL",
            statisticType: "sum",
          };

          const query1 = myLayer.createQuery();
          query1.groupByFieldsForStatistics = [groupFieldState];
          query1.orderByFields = [`${groupFieldState} desc`];
          query1.outStatistics = [consumeEnrollment];

          const statsResultsStates = await myLayer.queryFeatures(query1);
          States = statsResultsStates.features.map(function (feature, i) {
            return feature.attributes[groupFieldState];
          });
          const totEnrollmentByState = statsResultsStates.features.map(
            function (feature, i) {
              return feature.attributes[totalEnrollmentField];
            }
          );
          setAllStates(States);
          setTotalEnrollmentByState(totEnrollmentByState);

          const query2 = myLayer.createQuery();
          query2.groupByFieldsForStatistics = [groupFieldCity];
          query2.orderByFields = [`${groupFieldCity} desc`];
          query2.outStatistics = [consumeEnrollment];
          const statsResultsCity = await myLayer.queryFeatures(query2);
          Cities = statsResultsCity.features.map(function (feature, i) {
            return feature.attributes[groupFieldCity];
          });
          const totEnrollmentByCity = statsResultsCity.features.map(function (
            feature,
            i
          ) {
            return feature.attributes[totalEnrollmentField];
          });
          setAllCities(Cities);
          setTotalEnrollmentByCity(totEnrollmentByCity);
        };
        totalEnrollmentsQuery();

        const totalSchoolsQuery = async () => {
          const consumeSchools = {
            onStatisticField: schoolsField,
            outStatisticFieldName: "TotalSchools",
            statisticType: "count",
          };

          const query3 = myLayer.createQuery();
          query3.groupByFieldsForStatistics = [groupFieldState];
          query3.orderByFields = [`${groupFieldState} desc`];
          query3.outStatistics = [consumeSchools];

          const statsResultsStates = await myLayer.queryFeatures(query3);

          const totSchoolsByState = statsResultsStates.features.map(function (
            feature,
            i
          ) {
            return feature.attributes.TotalSchools;
          });
          setTotalSchoolsByState(totSchoolsByState);

          const query4 = myLayer.createQuery();
          query4.groupByFieldsForStatistics = [groupFieldCity];
          query4.orderByFields = [`${groupFieldCity} desc`];
          query4.outStatistics = [consumeSchools];

          const statsResultsCities = await myLayer.queryFeatures(query4);

          const totSchoolsByCity = statsResultsCities.features.map(function (
            feature,
            i
          ) {
            return feature.attributes.TotalSchools;
          });
          setTotalSchoolsByCity(totSchoolsByCity);
        };
        totalSchoolsQuery();

        ///////////////////////////////////////////////////////////////////////////////
        const select = async () => {
          let myLayerView;
          myLayer
            .when(() => {
              view.whenLayerView(myLayer).then(function (layerView) {
                myLayerView = layerView;
              });
            })
            .catch(errorCallback);

          let selectedFeatures = [];
          myLayer.on("selection-change", (changes) => {
            myLayerView.featureEffect = {
              filter: {
                objectIds: selectedFeatures,
              },
              excludedEffect: "blur(5px) grayscale(90%) opacity(40%)",
            };
          });
          const polygonGraphicsLayer = new GraphicsLayer();
          map.add(polygonGraphicsLayer);

          // add the select by rectangle button the view
          view.ui.add("select-by-rectangle", "top-left");
          const selectButton = document.getElementById("select-by-rectangle");

          // click event for the select by rectangle button
          selectButton.addEventListener("click", () => {
            view.popup.close();
            sketchViewModel.create("rectangle");
          });

          // add the clear selection button the view
          view.ui.add("clear-selection", "top-left");
          document
            .getElementById("clear-selection")
            .addEventListener("click", () => {
              setAllStates(States);
              setAllCities(Cities);
              myLayer.filterGeometry = null;
              polygonGraphicsLayer.removeAll();
            });
          // create a new sketch view model set its layer
          const sketchViewModel = new SketchViewModel({
            view: view,
            layer: polygonGraphicsLayer,
          });

          sketchViewModel.on("create", async (event) => {
            if (event.state === "complete") {
              const geometries = polygonGraphicsLayer.graphics.map(function (
                graphic
              ) {
                return graphic.geometry;
              });
              const queryGeometry = await geometryEngineAsync.union(
                geometries.toArray()
              );
              selectFeatures(queryGeometry);
            }
          });

          function selectFeatures(geometry) {
            if (myLayerView) {
              const query = {
                geometry: geometry,
                outFields: ["*"],
              };

              myLayerView
                .queryFeatures(query)
                .then((results) => {
                  if (results.features.length === 0) {
                    view.clearSelection();
                  } else {
                    myLayer.filterGeometry = geometry;
                    let stateSelected = [
                      ...new Set(
                        results.features.map((s) => s.attributes.STATE)
                      ),
                    ];
                    console.log("stateSelected", stateSelected);
                    setAllStates(stateSelected);

                    let citySelected = [
                      ...new Set(
                        results.features.map((c) => c.attributes.CITY)
                      ),
                    ];
                    console.log("citySelected", citySelected);
                    setAllCities(citySelected);
                  }
                })
                .catch(errorCallback);
            }
          }
          function errorCallback(error) {
            console.log("error happened:", error.message);
          }
          // console.log("selectedFeatures", selectedFeatures);
          // console.log("selectedFeatures", layerView);
        };
        select();
      });
    })();
  }, []);

  return (
    <>
      <div className="row mb-3 mt-3 mx-auto px-auto">
        <div className="col-3 card my-2 p-3 ms-3" style={{ height: "96vh" }}>
          <StateEnrollments
            allStates={allStates}
            totalEnrollmentByState={totalEnrollmentByState}
            style={{ height: "100%" }}
          />
          <hr />
          <CityEnrollments
            allCities={allCities}
            totalEnrollmentByCity={totalEnrollmentByCity}
          />
        </div>

        <div
          className="viewDiv col-6 pt-2 px-3 rounded-5"
          ref={myMapRef}
          style={{ width: "48%", height: "96.5vh" }}
        >
          <div
            id="select-by-rectangle"
            className="float-left esri-widget esri-widget--button esri-widget esri-interactive"
            title="Select features by rectangle"
          >
            <span className="esri-icon-checkbox-unchecked"></span>
          </div>
          <div
            id="clear-selection"
            className="float-left esri-widget esri-widget--button esri-widget esri-interactive"
            title="Clear selection"
          >
            <span className="esri-icon-erase"></span>
          </div>
        </div>

        <div className="col-3 card my-2 p-3" style={{ height: "96vh" }}>
          <StateSchools
            allStates={allStates}
            totalSchoolsByState={totalSchoolsByState}
          />
          <hr />
          <CitySchools
            allCities={allCities}
            totalSchoolsByCity={totalSchoolsByCity}
          />
        </div>
      </div>
    </>
  );
};

export default DasboardMap;
