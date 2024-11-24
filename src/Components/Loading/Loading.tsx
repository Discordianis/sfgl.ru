import React from "react";
import loading from '../../../public/icons/loading.gif'
import './Loading.css'

const Loading:React.FC = () => {
    return (
        <div className={'loading'}>
            <img src={`${loading}`} alt={'loading'}/>
        </div>
    )
}
export default Loading