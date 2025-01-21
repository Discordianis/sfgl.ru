import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState} from "../../../redux";
import Loading from "../../Loading/Loading.tsx";

const ProfileButton: React.FC = () => {

    const myData = useSelector((state: RootState) => state.myData.data)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (myData) {
            setLoading(false)
        }
        else {
            setLoading(true)
        }
    }, [myData]);

    return (
        <div className="profile_button_root">
            <div>
                <nav>
                    <NavLink to={`/users/${myData?.info.nickname}`} reloadDocument={true}>
                        {loading ?
                            <div className={'header_loading'}>
                                <Loading />
                            </div>
                            :
                            <img src={`${myData?.info.avatar}`} alt="user-avatar"/>
                        }
                        <span>{myData?.info.custom_nickname}</span>
                    </NavLink>
                </nav>
            </div>
        </div>
    );
};

export default ProfileButton;
