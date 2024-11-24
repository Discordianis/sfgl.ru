import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {useSelector} from "react-redux";
import Loading from "../../Loading/Loading.tsx";
import {RootState} from "../../../redux";

const ProfileButton: React.FC = () => {

    const token = localStorage.getItem('token')
    const server = useSelector((state: RootState) => state.server.server)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetching = async () => {
            const userRes = await fetch(`${server}`, {
                method: 'POST',
                body: JSON.stringify({action: 'getMyself', token: token})
            })
            const data = await userRes.json();
            setProfile(data)
            setLoading(false)
        }
        fetching()
    }, []);

    if (loading) {
        return (
            <div className={'small_loading'}>
                <Loading />
            </div>
        )
    }

    return (
        <div className="profile_button_root">
            <div>
                <nav>
                    <NavLink to={`/users/${profile?.info.nickname}`} reloadDocument={true}>
                        <img src={`${profile?.info.avatar}`} alt="user-avatar"/>
                        <span>{profile?.info.custom_nickname}</span>
                    </NavLink>
                </nav>
            </div>
        </div>
    );
};

export default ProfileButton;
