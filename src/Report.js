import {SecurityPrinciples} from "./models/securityPrinciples";

export const Report = (data) => {
    const securityPrinciples = Object.values(SecurityPrinciples);
    return (
        <div className="select-elements">
            <div className="spacer"/>
            {//TODO: implement descriptions
                securityPrinciples.map(securityPrinciple => {
                    const threats = data.data.filter(entry => entry.principle === securityPrinciple);
                    if (threats.length > 0) {
                        return (
                            <>
                                <h1>{securityPrinciple}</h1>
                                {threats.map(threat => (
                                    threat.elements.length > 0 ?
                                        <>
                                            <h2>{threat.threat}</h2>
                                            <h3>Elements</h3>
                                            {threat.elements.map(element => (
                                                    <div>{element.businessObject.name ? element.businessObject.name : element.id}</div>
                                                )
                                            )}
                                            <h3>Description</h3>
                                        </>
                                        : null
                                ))}
                            </>
                        );
                    }
                })
            }
        </div>
    )
}