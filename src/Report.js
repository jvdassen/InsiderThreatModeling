import {SecurityPrinciples} from "./models/securityPrinciples";
import {useEffect, useState} from "react";
import {ArrowSVG} from "./resources/ArrowSVG";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    console.log(data);
    const [rankingThreats, setRankingThreats] = useState([])
    const [rankingElements, setRankingOfElements] = useState([]);
    const color = ['#ff0000', '#e50000', '#ba0000', '#8d0000', '#6a0000']

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
        const elementCounts = data.data.reduce((counts, element) => {
            const {elements} = element;
            console.log("Elements", elements)
            elements.forEach((el) => {
                const name = el.businessObject ? el.businessObject.name : el.id;
                counts[name] = (counts[name] || 0) + 1;
            });
            return counts;
        }, {});

        // Step 2: Convert counts to an array of objects
        const elementRanking = Object.keys(elementCounts).map((element) => ({
            element,
            count: elementCounts[element],
        }));

        // Step 3: Sort the array based on count
        elementRanking.sort((a, b) => b.count - a.count);

        // Now, elementRanking contains the elements sorted by the number of occurrences
        console.log(elementRanking);
        setRankingOfElements(elementRanking);


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
            <h1>BPMN Element Ranking</h1>
            <div className="drop-down-box">
                {
                    rankingElements.map((threat, index) => (
                        <div
                            className="drop-down-item" style={{borderColor: color[index]}}>
                            {(index + 1) + ". " + threat.element + " (" + threat.count + ")"}
                            <ArrowSVG/>
                        </div>
                    ))}
            </div>

            <div className="spacer"/>
            <div className="spacer"/>
            <div className="spacer"/>
            {securityPrinciples.map(securityPrinciple => {
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