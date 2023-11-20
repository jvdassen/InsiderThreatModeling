import React, {useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import diagramXML from './resources/newDiagram.bpmn';
import {database} from "./models/database";
import {Report} from "./Report";

const BpmnModelViewer = (selectedPrinciples) => {
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

    const canvas = document.getElementById("js-canvas");
    const modelerRef = useRef(null);

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
                    paletteProvider: ["value", {}]
                }
            ]
        });

        function createNewDiagram() {
            openDiagram(diagramXML);
        }

        async function openDiagram(xml) {
            try {
                await modelerRef.current.importXML(xml);
                container.classList.remove('with-error');
                container.classList.add('with-diagram');
                setDiagramLoaded(true);

                //Fit the viewport
                const canvas = modelerRef.current.get("canvas");
                canvas.zoom("fit-viewport");
            } catch (err) {
                container.classList.remove('with-diagram');
                container.classList.add('with-error');
                container.find('.error pre').text(err.message);

                console.error(err);
            }
        }

        function registerFileDrop(container, callback) {
            function handleFileSelect(e) {
                e.stopPropagation();
                e.preventDefault();

                const files = e.dataTransfer.files;
                const file = files[0];

                const reader = new FileReader();

                reader.onload = function (e) {
                    const xml = e.target.result;
                    callback(xml);
                };

                reader.readAsText(file);
            }

            function handleDragOver(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }

            container.addEventListener('dragover', handleDragOver, false);
            container.addEventListener('drop', handleFileSelect, false);
        }

        if (!window.FileList || !window.FileReader) {
            window.alert('Looks like you use an older browser that does not support drag and drop. ' +
                'Try using Chrome, Firefox, or the Internet Explorer > 10.');
        } else {
            registerFileDrop(container, openDiagram);
        }

        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('js-create-diagram').addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                createNewDiagram();
            });

            const downloadLink = document.getElementById('js-download-diagram');
            const downloadSvgLink = document.getElementById('js-download-svg');

            function setEncoded(link, name, data) {
                const encodedData = encodeURIComponent(data);
                console.log(encodedData);

                if (data) {
                    link.classList.add('active');
                    link.href = `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`;
                    link.download = name;
                } else {
                    link.classList.remove('active');
                }
            }

            const exportArtifacts = debounce(async function () {
                try {
                    const {svg} = await modelerRef.current.saveSVG();
                    setEncoded(downloadSvgLink, 'diagram.svg', svg);
                } catch (err) {
                    console.error('Error happened saving svg: ', err);
                    setEncoded(downloadSvgLink, 'diagram.svg', null);
                }

                try {
                    const {xml} = await modelerRef.current.saveXML({format: true});
                    setEncoded(downloadLink, 'diagram.bpmn', xml);
                } catch (err) {
                    console.error('Error happened saving XML: ', err);
                    setEncoded(downloadLink, 'diagram.bpmn', null);
                }
            }, 500);

            modelerRef.current.on('commandStack.changed', exportArtifacts);
        });

        function debounce(fn, timeout) {
            let timer;

            return function () {
                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(fn, timeout);
            };
        }
    }, [isDiagramLoaded, canvas]);

    const colorModel = (elements, color) => {
        const elementRegistry = modelerRef.current.get('elementRegistry');
        const modeling = modelerRef.current.get('modeling');
        const allElements = Object.values(elementRegistry._elements).map(entry => entry.element);
        modeling.setColor(allElements, {stroke: '#000000'});
        modeling.setColor(elements, {stroke: color});
    }

    function onShowThreats() {
        console.log("Security Principles:", selectedPrinciples.selectedPrinciples);
        const elementRegistry = modelerRef.current.get('elementRegistry');
        console.log('elementRegistry', elementRegistry);

        selectedPrinciples.selectedPrinciples.map(principle => {
            visualizeThreats(principle, elementRegistry);
        })
    }

    async function getModel() {
        try {
            const {xml} = await modelerRef.current.saveXML({format: true});
            return xml;
        } catch (err) {
            console.error('Error happened saving XML: ', err);
        }
    }

    //show all elements of threats that belong to one security principle
    const visualizeThreats = (securityPrinciple, elementRegistry) => {
        //filters out all threats of the principle
        const entry = database.find(e => e.principle === securityPrinciple);
        const threats = entry.threats;

        let threatsFound = [];
        threats.map(threat => {
            let elementsInModel = [];
            //elements that are applicable to threat
            if (threat.elements) {
                //all bpmn element types that belong to the threat type
                const bpmnElements = threat.elements;

                let elements = [];
                bpmnElements.map(bpmnElement => {
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
                    //if there is an element in the elementregistry for the threat, add the threat to threatsFound
                    if (elements.length > 0) {
                        elementsInModel.push(...elements);
                    }
                });

            }
            if (elementsInModel.length > 0) {
                threatsFound.push({threat: threat.threat, elements: elementsInModel});
            }
        });
        //add only threats that were actually found in diagram
        setAllThreatsFound((prevThreats) => [...prevThreats, {
            principle: securityPrinciple,
            threats: threatsFound
        }])
        if (allThreatsFound.length > 0) {
            console.log("First threat: ", allThreatsFound[0]);
            setCurrentThreatAndPrinciple({
                threat: allThreatsFound[0].threats[0].threat,
                principle: allThreatsFound[0].principle
            })
        }
    }
    //show all elements of one threat
    const showElementsOfThreat = (securityPrinciple, t) => {
        setCurrentThreatAndPrinciple({threat: t, principle: securityPrinciple});
        const threatsOfPrinciple = allThreatsFound.find(p => p.principle === securityPrinciple);
        const elementsConnectedToThreat = threatsOfPrinciple.threats.find(p => p.threat === t);
        let elementsToColor = elementsConnectedToThreat.elements;
        colorModel(elementsToColor, '#ff6600');
        setElementsConnectedToCurrentThreat(elementsToColor);
    }

    const onShowReport = () => {
        let elementsToColor = [];
        setReportShown(true);
        finalElementSelection.map(e => {
            elementsToColor.push(...e.elements)
        })
        console.log("EES", elementsToColor);
        colorModel(elementsToColor, '#ff6600');
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
        //TODO: go to next threat
        /*const index = allThreatsFound.indexOf(selectedThreat);
        console.log("index", index)
        setSelectedThreat(allThreatsFound[index + 1]);
         */
    }

    return (
        <div className="parent-container">
            {reportShown ?
                <Report data={finalElementSelection}/>
                : (
                    <>
                        <div className="content" id="js-drop-zone">
                            <div className="message intro">
                                <div className="note">
                                    Drop BPMN diagram from your desktop
                                    {/*or <a id="js-create-diagram" href>create a new diagram</a>*/} to get started.
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
                        {allThreatsFound.length > 0 && !reportShown ? (
                            <>
                                <div className="threat-box">
                                    <h1>
                                        Threats found:
                                    </h1>
                                    {allThreatsFound.map(p => (
                                        <div key={p.principle}>
                                            <h2>
                                                {Object.values(p.principle)}
                                            </h2>
                                            <div className="flex-column">
                                                {p.threats.map(t => (
                                                    <button
                                                        style={{
                                                            backgroundColor: currentThreatAndPrinciple.threat === t.threat ? '#ff6600' : null,
                                                            margin: "8px"
                                                        }}
                                                        key={t.threat.toString()}
                                                        onClick={() => onThreatSelected(p, t)}>
                                                        {t.threat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="select-elements">
                                    <div className="spacer"/>
                                    <h1>
                                        Select BPMN elements:
                                    </h1>
                                    <text>
                                        Please revise the threats and decide for each threat which elements in the
                                        business process that could be problematic for the threats.
                                    </text>

                                    <h2>
                                        {currentThreatAndPrinciple.threat}
                                    </h2>

                                    {!submitted ?
                                        <div
                                            className="multi-select">                                                {elementsConnectedToThreat.map(element => (
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
                                            )
                                        )}
                                            <button className="submit" onClick={() => onSubmit()}>
                                                Submit
                                            </button>

                                        </div>
                                        :
                                        null}

                                </div>
                                <button className="report" onClick={() => onShowReport()}>
                                    Show Report
                                </button>
                            </>
                        ) : (
                            <button className={"submit"} onClick={() => onShowThreats()}>
                                Show Threats
                            </button>

                        )}


                    </>)}
        </div>
    );
};

export default BpmnModelViewer;


{/*  <ul className="buttons">
                <li>download</li>
                <li>
                    <a id="js-download-diagram" href title="download BPMN diagram">
                        BPMN diagram
                    </a>
                </li>
                <li>
                    <a id="js-download-svg" href title="download as SVG image">
                        SVG image
                    </a>
                </li>

             </ul>*/
}