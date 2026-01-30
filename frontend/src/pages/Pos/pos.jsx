import { useState } from "react";
function incre()
{
    const [count, setCount] = useState(0);
    const increment = () => {
        setCount(count + 1);
    }
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={increment}>+</button>
        </div>
    );
}
export default incre;