import React, {useCallback, useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {database} from "../models/database";
import {Report} from "./Report";
import {ArrowSVG} from "../resources/ArrowSVG";
import newDiagramPath from "../resources/newDiagram.bpmn";
import {PDFDownloadLink} from "@react-pdf/renderer";
import {DownloadReport} from "../resources/downloadReport";

const COLORS = ['#ff0000', '#ce0002', '#990001', '#6a0000', '#450001', '#260000']


const BpmnModelViewer = (selectedPrinciples) => {
    const canvas = document.getElementById("js-canvas");
    const modelerRef = useRef(null);

    const [isDiagramLoaded, setDiagramLoaded] = useState(false);
    const [allThreatsFound, setAllThreatsFound] = useState([]);
    const [currentThreatAndPrinciple, setCurrentThreatAndPrinciple] = useState({});
    const [elementsConnectedToThreat, setElementsConnectedToCurrentThreat] = useState([]);

    //elements in currently selected threat
    const [selectedElements, setSelectedElements] = useState([]);
    //subset of selected elements: all that are marked as important for the threat
    const [finalElementSelection, setFinalElementSelection] = useState([]);

    const [reportShown, setReportShown] = useState(false);
    const [submitted, setSubmitted] = useState(false)

    //Report
    const [rankingElements, setRankingOfElements] = useState([]);
    const [colorIndex, setColorIndex] = useState([]);
    const [showThreats, setShowThreats] = useState([]);

    const [downloadBPMNLink, setDownloadBPMNLink] = useState('');
    const [svgLink, setSvgLink] = useState('');
    const [svgDiagram, setSvgDiagram] = useState(null);

    const handleDragOver = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleFileSelect = useCallback((e, callback, container) => {
        e.stopPropagation();
        e.preventDefault();

        const files = e.dataTransfer.files;
        const file = files[0];

        const reader = new FileReader();

        reader.onload = function (e) {
            const xml = e.target.result;
            callback(xml, container);
        };

        reader.readAsText(file);

    }, []);

    const openDiagram = useCallback(async (xml, container) => {

        try {
            await modelerRef.current.importXML(xml);

            container.classList.remove('with-error');
            container.classList.add('with-diagram');

            setDiagramLoaded(true);

            //Fit the viewport
            const canvas = modelerRef.current.get("canvas");
            canvas.zoom("fit-viewport");

            await modelerRef.current.saveXML(xml);
            await modelerRef.current.saveSVG();


        } catch (err) {
            container.classList.remove('with-diagram');
            container.classList.add('with-error');

            container.find('.error pre').text(err.message);

            console.error(err);
        }
    }, []);


    useEffect(() => {
        const container = document.getElementById('js-drop-zone');

        modelerRef.current = new BpmnModeler({
            container: canvas,
            keyboard: {
                bindTo: document,
            },
            //would help to get rid of sidebar
            additionalModules: [
                {
                    palette: ["value", {}],
                    paletteProvider: ["value", {}],
                }
            ]
        });


        // Needed to preload modeler to make drag & drop work -
        const loadDiagram = async () => {
            try {
                const response = await fetch(newDiagramPath);
                const xml = await response.text();
                await openDiagram(xml, container);
            } catch (err) {
                console.error(err);
            }
        };

        loadDiagram();

        container.addEventListener('dragover', (e) => handleDragOver(e), false);
        container.addEventListener('drop', (e) => handleFileSelect(e, openDiagram, container), false);

        container.addEventListener('drop', (e) => handleFileSelect(e, openDiagram, container), false);


    }, [canvas, handleDragOver, handleFileSelect, openDiagram]);

    const getBpmnElement = (id) => {
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const element = elementRegistry.find(bpmnElement => bpmnElement.id === id);
        if (element) {
            console.log(element);
            return element;
        }
    }
    const colorModel = (elements, color, repaint) => {
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const modeling = modelerRef.current.get('modeling');
        const allElements = Object.values(elementRegistry._elements).map(entry => entry.element);
        if (repaint) {
            modeling.setColor(allElements, {stroke: null})
        }
        if (elements.length > 0) {
            modeling.setColor(elements, {stroke: color});
        }

    }
    const annotateWithNumber = (name, element, number) => {
        const modeling = modelerRef.current.get('modeling');

        modeling.updateProperties(element, {
            name: number + '. ' + name
        });
    }


    function onShowThreats() {
        const elementRegistry = modelerRef.current.get('elementRegistry');

        selectedPrinciples.selectedPrinciples.forEach(principle => {
            visualizeThreats(principle, elementRegistry);
        })
    }

    //show all elements of threats that belong to one security principle
    const visualizeThreats = async (securityPrinciple, elementRegistry) => {
        //filters out all threats of the principle
        const entry = database.find(e => e.principle === securityPrinciple);
        const threats = entry.threats;

        let threatsFound = [];
        threatsFound = threats.map(threat => {
            let elementsInModel = [];
            //elements that are applicable to threat
            if (threat.elements) {
                //all bpmn element types that belong to the threat type
                const bpmnElements = threat.elements;

                let elements = [];
                bpmnElements.forEach(bpmnElement => {
                    if (bpmnElement === 'IntermediateCatchEvent') {
                        elements = elementRegistry.filter(e => {
                            if (e.type === 'bpmn:IntermediateCatchEvent') {
                                return e.businessObject.eventDefinitions.some(
                                    (eventDefinition) => eventDefinition.$type === 'bpmn:MessageEventDefinition'
                                );
                            }
                            return false;
                        });
                    } else if (bpmnElement === "StartEvent") {
                        elements = elementRegistry.filter(e => {
                            if (e.type === 'bpmn:StartEvent') {
                                return e.businessObject.eventDefinitions.some(
                                    (eventDefinition) => eventDefinition.$type === 'bpmn:MessageEventDefinition'
                                );
                            }
                            return false;
                        });
                    } else {
                        //filters out all elements of the same type (e.g. UserTask) in the provided bpmn model
                        elements = elementRegistry.filter(e => e.type === 'bpmn:' + bpmnElement);
                    }
                    console.log("threat", threat.threat)

                    console.log("ELEMENTS", elements)
                    //if there is an element in the elementregistry for the threat, add the threat to threatsFound
                    if (elements.length > 0) {
                        elementsInModel.push(...elements);
                    }
                });

            }
            console.log("elements in model", elementsInModel)
            if (elementsInModel.length > 0) {
                return ({threat: threat.threat, elements: elementsInModel});
            }
        });
        //add only threats that were actually found in diagram
        setAllThreatsFound((prevThreats) => [...prevThreats, {
            principle: securityPrinciple,
            threats: threatsFound.filter(t => t !== undefined),
        }])
        //onThreatSelected(securityPrinciple, threatsFound[0].threat)
    }
    const showElementsOfThreat = (securityPrinciple, t) => {
        setCurrentThreatAndPrinciple({threat: t, principle: securityPrinciple});
        const threatsOfPrinciple = allThreatsFound.find(p => p.principle === securityPrinciple);
        console.log(allThreatsFound);
        const elementsConnectedToThreat = threatsOfPrinciple.threats.find(p => p.threat === t);
        let elementsToColor = elementsConnectedToThreat.elements;
        colorModel(elementsToColor, '#ff6600', true);
        setElementsConnectedToCurrentThreat(elementsToColor);
    }

    function setEncoded(data) {
        const encodedData = encodeURIComponent(data);

        if (data) {
            const href = `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`
            return (href);

        } else {
            console.log("No data")
        }
    }

    const debounce = (fn, timeout) => {
        let timer;

        return function () {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(fn, timeout);
        };
    }


    const downloadBpmn = () => {
        const exportArtifacts = debounce(async function () {
            try {
                const {xml} = await modelerRef.current.saveXML({format: true});
                const href = setEncoded(xml);
                if (href) {
                    setDownloadBPMNLink(href);
                }
            } catch (err) {
                console.error('Error happened saving XML: ', err);
                setEncoded(null);
            }
        }, 500);
        exportArtifacts();
    }


    const downloadSvg = () => {
        const exportArtifacts = debounce(async function () {
            try {
                const {svg} = await modelerRef.current.saveSVG();
                setSvgDiagram(svg);
                const href = setEncoded(svg);
                if (href) {
                    setSvgLink(href)
                }

            } catch (err) {
                console.error('Error happened saving svg: ', err);
                setEncoded(null);
            }

        }, 500);
        exportArtifacts();
    }

    const pdfDownloadLink = useCallback(() => {
        if (rankingElements.length > 0) {
            return (
                <PDFDownloadLink
                    document={<DownloadReport
                        data={finalElementSelection}
                        elements={rankingElements}
                        svg={svgDiagram}/>
                    }
                    fileName="insiderThreatReport">
                    {({loading}) => (loading ? <div>Loading Document...</div> :
                        <button className="submit">PDF report</button>)}
                </PDFDownloadLink>)
        }
    }, [rankingElements, svgDiagram]);

    const onShowReport = () => {
        setReportShown(true);

        let elementsToColor = [];
        finalElementSelection.forEach(e => {
            elementsToColor.push(...e.elements)
        })
        //reset color
        colorModel(elementsToColor, '#000000', true)

        //ELEMENTS
        // Step 1: Count occurrences of individual elements
        const elementCounts = finalElementSelection.reduce((threatsPerElement, element) => {
            const {elements} = element;
            const threat = element.threat;
            elements.forEach((el) => {
                const name = el.businessObject ? el.businessObject.name : el.id;
                // counts[name] = (counts[name] || 0) + 1;
                if (!threatsPerElement[name]) {
                    threatsPerElement[name] = []; // Initialize the array if not already present
                }
                threatsPerElement[name].push(threat);
            });
            return threatsPerElement;
        }, {});

        // Step 2: Convert counts to an array of objects
        const elementRanking = Object.keys(elementCounts).map((element) => {
            const elementRegistry = modelerRef.current.get('elementRegistry');
            const bpmnElement = elementRegistry.find(item => item.businessObject ? item.businessObject.name === element : null);
            if (bpmnElement) {
                console.log(bpmnElement);
            }
            return ({
                element,
                count: elementCounts[element].length,
                threats: elementCounts[element],
                bpmnElementId: bpmnElement.id
            });
        });
        // Step 3: Sort the array based on count
        elementRanking.sort((a, b) => b.count - a.count);


        //Step 4: Color elements depending on how many threats were found
        const colorCount = []
        elementRanking.forEach(entry => {
            if (!colorCount.includes(entry.count)) {
                colorCount.push(entry.count);
            }
        })
        setColorIndex(colorCount);


        elementRanking.forEach((element) => {
            const i = colorCount.indexOf(element.count);
            const bpmnElement = getBpmnElement(element.bpmnElementId);
            colorModel([bpmnElement], COLORS[i], false);
            annotateWithNumber(element.element, bpmnElement, elementRanking.indexOf(element) + 1);
        });

        // Now, elementRanking contains the elements sorted by the number of occurrences
        setRankingOfElements(elementRanking);

        //make diagram ready to download
        downloadBpmn();
        downloadSvg();
    }

    const onThreatSelected = (principleSelected, threatSelected) => {
        setSubmitted(false);
        if (finalElementSelection.find(e => e.threat === threatSelected.threat)) {
            setSelectedElements(finalElementSelection.find(e => e.threat === threatSelected.threat).elements)
        } else {
            setSelectedElements([]);
        }
        showElementsOfThreat(principleSelected.principle, threatSelected.threat);
    }

    const onElementSelected = (element) => {
        if (selectedElements.includes(element)) {
            setSelectedElements((prevSelectedElements) => {
                if (prevSelectedElements.includes(element)) {
                    // If the element is already in the array, remove it using filter
                    return prevSelectedElements.filter((item) => item !== element);
                }
            })
        } else {
            setSelectedElements([...selectedElements, element]);
        }
    }

    const onSubmit = () => {
        //prevent user from inserting threats more than once, just update entry
        if (finalElementSelection.find(e => e.threat === currentThreatAndPrinciple.threat)) {
            const currentEntries = finalElementSelection.filter(e => e.threat !== currentThreatAndPrinciple.threat);
            setFinalElementSelection([...currentEntries, {
                principle: currentThreatAndPrinciple.principle,
                threat: currentThreatAndPrinciple.threat,
                elements: selectedElements
            }
            ]);
        } else {
            setFinalElementSelection([...finalElementSelection, {
                principle: currentThreatAndPrinciple.principle,
                threat: currentThreatAndPrinciple.threat,
                elements: selectedElements
            }])
        }
        setSubmitted(true);
    }

    const handleItemClick = (index) => {
        setShowThreats((prevState) => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };
    return (
        <div className="parent-container">
            <div className="content" id="js-drop-zone">
                <div className="message intro">
                    <div className="note">
                        Drop BPMN diagram from your desktop
                    </div>
                </div>
                <div className="message error">
                    <div className="note">
                        <p>Ooops, we could not display the BPMN 2.0 diagram.</p>
                        <div className="details">
                            <span>cause of the problem</span>
                            <pre></pre>
                        </div>
                    </div>
                </div>
                <div className="canvas" id="js-canvas"></div>
            </div>
            {allThreatsFound.length > 0 ? (
                !reportShown ? (
                    <div className="threat-box">
                        <h1>
                            Threats found:
                        </h1>
                        {allThreatsFound.map(p => {

                            return (
                                <div key={p.principle}>
                                    <h2>
                                        {Object.values(p.principle)}
                                    </h2>
                                    <div className="flex-column">
                                        {p.threats.map(t => (
                                            <button
                                                style={{
                                                    backgroundColor: currentThreatAndPrinciple.threat === t.threat ? '#ff6600' : null,
                                                    fontWeight: currentThreatAndPrinciple.threat === t.threat ? 700 : 400,
                                                    margin: "8px"
                                                }}
                                                key={t.threat.toString()}
                                                onClick={() => onThreatSelected(p, t)}>
                                                {t.threat}
                                            </button>))}
                                    </div>
                                </div>)
                        })
                        }
                    </div>
                ) : (
                    <div className="threat-box" id="identified-elements">
                        <div className="spacer"/>
                        <h1>Identified Elements</h1>
                        <div className="drop-down-box">
                            {rankingElements.map((element, index) => {
                                const i = colorIndex.indexOf(element.count);
                                return (
                                    <div
                                        className="drop-down-item"
                                        style={{
                                            borderColor: COLORS[i],
                                            flexDirection: showThreats[index] ? "column" : "row",
                                            alignItems: showThreats[index] ? "flex-start" : "center",
                                            color: COLORS[i]
                                        }}
                                        onClick={() => handleItemClick(index)}
                                    >
                                        {(index + 1) + ". " + element.element + " (" + element.count + ")"}
                                        {showThreats[index] ? (
                                            <div>
                                                <div className="spacer"/>
                                                {element.threats.map(t => (
                                                    <div className="dropped-down">
                                                        {t}
                                                    </div>

                                                ))}
                                            </div>
                                        ) : (<ArrowSVG/>)}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                )) : null}
            {reportShown ?
                <>
                    <Report data={finalElementSelection}/>
                    <ul className="buttons">
                        <li>
                            download
                        </li>
                        <li>
                            <a id="js-download-diagram"
                               href={downloadBPMNLink ? downloadBPMNLink : null} download="insiderThreatDiagram.bpmn"
                               target="_blank">
                                BPMN diagram
                            </a>
                        </li>
                        <li>
                            <a id="js-download-svg"
                               href={svgLink ? svgLink : null} download="insiderThreatDiagram.svg" target="_blank">
                                SVG image
                            </a>
                        </li>
                        {pdfDownloadLink()}
                    </ul>
                </>
                : (allThreatsFound.length > 0 ? (
                        <>
                            <div className="select-elements">
                                <div className="spacer"/>
                                <h1>
                                    Select BPMN elements:
                                </h1>
                                <div>
                                    Please revise the threats and decide for each threat which elements in the
                                    business process that could be problematic for the threats.
                                </div>
                                <h2>
                                    {currentThreatAndPrinciple.threat}
                                </h2>
                                {!submitted ?
                                    <div
                                        className="multi-select">
                                        {elementsConnectedToThreat.map(element => (
                                            <button
                                                className="multi-select-box"
                                                key={element.id}
                                                onClick={() => onElementSelected(element)}>
                                                <div className="check-box">
                                                    {selectedElements.includes(element) ? (
                                                        <div className="check-box-fill"/>
                                                    ) : null}
                                                </div>
                                                {element.businessObject.name ? element.businessObject.name : element.id}
                                            </button>
                                        ))}
                                        <button className="submit" onClick={() => onSubmit()}>
                                            Submit
                                        </button>
                                    </div>
                                    : null}
                            </div>
                            <button className="report" onClick={() => onShowReport()}>
                                Show Report
                            </button>

                        </>) :
                    isDiagramLoaded ?
                        (
                            <button className={"submit"} onClick={() => onShowThreats()}>
                                Show Threats
                            </button>
                        ) : null)}

        </div>
    );
};

export default BpmnModelViewer;

