import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Room = () => {

    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get('name');

    useEffect(() => {
    }
    , [name]);

    return (
        <div>
            <h1>hii {name}</h1>
        </div>
    );

}

export default Room;