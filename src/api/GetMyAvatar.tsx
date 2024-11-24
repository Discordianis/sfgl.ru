import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../redux";

const GetMyAvatar: React.FC = () => {

    const myData = useSelector((state: RootState) => state.myData)

    return (
        <>
            <img src={`${myData.data?.info.avatar}`} alt={'user-avatar'}/>
        </>
    )
}
export default GetMyAvatar