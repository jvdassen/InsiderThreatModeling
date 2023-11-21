import {SecurityPrinciples} from "./models/securityPrinciples";
import {useEffect, useState} from "react";
import {ArrowSVG} from "./resources/ArrowSVG";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    console.log(data);
    const [rankingThreats, setRankingThreats] = useState([])
    const [rankingElements, setRankingOfElements] = useState([]);
    const color = ['#ff0000', '#ba0000', '#8d0000', '#6a0000', '#450001', '#260000']
    const [colorIndex, setColorIndex] = useState([]);
    const [showThreat, setShowThreat] = useState([]);

    const handleItemClick = (index) => {
        setShowThreat((prevState) => {
            const newState = [...prevState];
            newState[index] = !newState[index];
            return newState;
        });
    };

    useEffect(() => {
        //THREATS
        // Step 1: Count occurrences of elements per threat
        const threatCounts = data.data.reduce((counts, element) => {
            const {threat, elements} = element;
            counts[threat] = elements.length;
            return counts;
        }, {});

        // Step 2: Convert counts to an array of objects
        const threatRanking = Object.keys(threatCounts).map((threat) => ({
            threat,
            count: threatCounts[threat],
        }));

        // Step 3: Sort the threats based on count
        threatRanking.sort((a, b) => b.count - a.count);
        setRankingThreats(threatRanking);

        //ELEMENTS
        // Step 1: Count occurrences of individual elements
        const elementCounts = data.data.reduce((threatsPerElement, element) => {
            console.log(element);
            const {elements} = element;
            const threat = element.threat;
            console.log("Elements", elements)
            elements.forEach((el) => {
                const name = el.businessObject ? el.businessObject.name : el.id;
                // counts[name] = (counts[name] || 0) + 1;
                if (!threatsPerElement[name]) {
                    threatsPerElement[name] = []; // Initialize the array if not already present
                }
                threatsPerElement[name].push(threat);
                console.log("In the loop", threatsPerElement[name])
            });
            console.log("TPE", threatsPerElement)
            return threatsPerElement;
        }, {});

        console.log("ELEMENTCOUNTS", elementCounts)

        // Step 2: Convert counts to an array of objects
        const elementRanking = Object.keys(elementCounts).map((element) => ({
            element,
            count: elementCounts[element].length,
            threats: elementCounts[element]
        }));

        // Step 3: Sort the array based on count
        elementRanking.sort((a, b) => b.count - a.count);


        const colorCount = []
        elementRanking.map(entry => {
            if (!colorCount.includes(entry.count)) {
                colorCount.push(entry.count);
            }
        })
        setColorIndex(colorCount);

        // Now, elementRanking contains the elements sorted by the number of occurrences
        console.log("elementRaking ", elementRanking);
        setRankingOfElements(elementRanking);
        console.log("COLORS: ", colorCount);
    }, [data.data]);

    return (
        <div className="flex-left">
            <div className="spacer"/>
            {/* <h1>Threat Ranking</h1>
            {
                rankingThreats.map((threat, index) => (
                    <div>{(index + 1) + ". " + threat.threat + " (" + threat.count + ")"}</div>
                ))}
            <div className="spacer"/>*/}
            <h1>Identified Elements</h1>
            <div className="drop-down-box">
                {
                    rankingElements.map((threat, index) => {
                        const i = colorIndex.indexOf(threat.count);
                        return (
                            <div
                                className="drop-down-item"
                                style={{
                                    borderColor: color[i],
                                    flexDirection: showThreat[index] ? "column" : "row",
                                    alignItems: showThreat[index] ? "flex-start" : "center"
                                }}
                                onClick={() => handleItemClick(index)}
                            >
                                {(index + 1) + ". " + threat.element + " (" + threat.count + ")"}
                                {showThreat[index] ? (
                                        <div>
                                            <div className="spacer"/>
                                            {threat.threats.map(t => (
                                                <div className="dropped-down">
                                                    {t}
                                                </div>

                                            ))}
                                        </div>
                                    ) :
                                    (<ArrowSVG/>)}
                            </div>
                        )
                    })}
            </div>

            <div className="spacer"/>
            <div className="spacer"/>
            <div className="spacer"/>
            {//TODO: implement descriptions
                securityPrinciples.map(securityPrinciple => {
                    const threats = data.data.filter(entry => entry.principle === securityPrinciple);
                    if (threats.length > 0) {
                        return (
                            <>
                                <h1>{securityPrinciple}</h1>
                                {threats.map(threat => (
                                    <>
                                        <h2>{threat.threat}</h2>
                                        {threat.elements.map(element => (
                                                <div>{element.businessObject.name ? element.businessObject.name : element.id}</div>
                                            )
                                        )}
                                    </>
                                ))}
                            </>
                        );
                    }
                })
            }
        </div>
    )
}