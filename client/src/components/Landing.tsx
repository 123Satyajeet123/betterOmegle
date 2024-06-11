import  { useState } from 'react';
import {Link} from 'react-router-dom';


const Landing = () => {

    const [name, setName] = useState('');

    return (
        <div>
            <h1>Landing</h1>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <Link to={`/room/?name=${name}`} >Submit</Link>
        </div>
    );
    }

export default Landing;