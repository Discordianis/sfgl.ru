import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./Components/Main/Header/Header.tsx";
import MainMenu from './Components/Main/MainMenu/MainMenu.tsx';
import LoginPage from "./Components/Main/LoginPage/LoginPage.tsx";
import Registration from "./Components/Main/Registration/Registration.tsx";
import Background from "./Components/Background/Background.tsx";
import Profile from "./Components/Main/Profile/Profile.tsx";
import Home from "./Components/Main/Home/Home.tsx";
import ProfileSettings from "./Components/Main/Profile/ProfileSettings/ProfileSettings.tsx";
import ArchiveAdd from "./Components/Main/AddInfo/Archive/ArchiveAdd/ArchiveAdd.tsx";
import AdminPage from "./Components/Main/AdminPage/AdminPage.tsx";
import Faq from "./Components/Main/Faq/Faq.tsx";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {fetchData} from "./redux/fetch/myData.tsx";
import {AppDispatch} from "./redux";
import notFound from "./Components/NotFound/NotFound.tsx";
import RoundTable from "./Components/Main/OtherPages/RoundTable/RoundTable.tsx";
import AddRoundTable from "./Components/Main/AddInfo/AddRoundTable/AddRoundTable.tsx";
import Fridays from "./Components/Main/OtherPages/Fridays/Fridays.tsx";
import AddFridays from "./Components/Main/AddInfo/AddFridays/AddFridays.tsx";
import LabLibMenu from "./Components/Main/OtherPages/LabLib/LabLibMenu.tsx";
import LabLibStoryPage from "./Components/Main/OtherPages/LabLib/LabLibStoryPage/LabLibStoryPage.tsx";
import LabLibCharacterPage from "./Components/Main/OtherPages/LabLib/LabLibCharacterPage/LabLibCharacterPage.tsx";
import LabLibStoryCharacters from "./Components/Main/OtherPages/LabLib/LabLibStoryCharacters/LabLibStoryCharacters.tsx";
import LabLibRead from "./Components/Main/OtherPages/LabLib/LabLibRead/LabLibRead.tsx";
import AddLibrary from "./Components/Main/AddInfo/AddLibrary/AddLibrary.tsx";
import Wall from "./Components/Main/Wall/Wall.tsx";

export default function App() {
    const token = localStorage.getItem('token');
    const dispatch: AppDispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchData());
    }, [dispatch]);

    return (
        <div className={'main'}>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Background />
                <Header />
                <Routes>
                    <Route path={'/'} Component={Home} />
                    {token ?
                    <>
                        <Route path={'/archive'} Component={MainMenu} />
                        <Route path={'/login'} Component={LoginPage} />
                        <Route path={'/registration'} Component={Registration} />
                        <Route path={'/users/:nickname'} Component={Profile} />
                        <Route path={'/library'} Component={LabLibMenu} />
                        <Route path={'/library/story/:story'} Component={LabLibStoryPage} />
                        <Route path={'/library/story/:story/read/:read'} Component={LabLibRead} />
                        <Route path={'/library/story/:story/characters'} Component={LabLibStoryCharacters} />
                        <Route path={'/library/characters/:characters'} Component={LabLibCharacterPage} />
                        <Route path={'/users/:nickname/settings'} Component={ProfileSettings} />
                        <Route path={'/users/:nickname/createInfo/archive'} Component={ArchiveAdd} />
                        <Route path={'/users/:nickname/createInfo/roundTable'} Component={AddRoundTable} />
                        <Route path={'/users/:nickname/createInfo/fridays'} Component={AddFridays} />
                        <Route path={'/users/:nickname/createInfo/library'} Component={AddLibrary} />
                        <Route path={'/admin'} Component={AdminPage} />
                        <Route path={'/faq'} Component={Faq} />
                        <Route path={'/wall'} Component={Wall} />
                        <Route path={'/roundtable'} Component={RoundTable} />
                        <Route path={'/fridays'} Component={Fridays} />
                        <Route path={'*'} Component={notFound} />
                    </>
                    :
                    <>
                        <Route path={'*'} Component={LoginPage} />
                        <Route path={'/registration'} Component={Registration} />
                    </>
                    }
                </Routes>
            </BrowserRouter>
        </div>
    );
}
