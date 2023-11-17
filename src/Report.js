export const Report = (data) => {
    console.log(data)
    return (
        <div>
            {data.data.map(p => (
                    <div>
                        {p.threat + " . " + p.principle + " . " + p.elements.map(e =>
                            e.businessObject.name + " _ "
                        )}
                    </div>
                )
            )}
        </div>
    )
}