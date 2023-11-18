import {SecurityPrinciples} from "./models/securityPrinciples";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    console.log(data);

    const makeRankingOfElements = () => {

    }
    const makeRankingOfThreats = () => {
        
    }
    return (
        <div className="flex">
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