import styles from '../../../styles/Styles.module.css'
import {useState,useRef} from 'react'
import axios from 'axios';
import Cookie from 'universal-cookie'

export default function ShareContainer(props) {

    const search = useRef();
    const [datas,setData] = useState([]);

    function Close() {
        props.setIsOpen(<div></div>)
    }

    function Search() {
        axios.get('http://localhost:3001/search/'+search.current.value)
        .then(function (response) {
            console.log(response.data)
            setData(response.data)
        })
    }

    function Send(e) {
        const cookie = new Cookie();

        const options = {
            data: {sender: cookie.get('LoggedIn'), recipient: e.target.value, file: props.fileName }
        }
        axios.post('http://localhost:3001/share', options)
        .then(function (response) {
            if (response.data.success === true) {
                Close()
            }
            else {
                console.log("Error")
            }
        })
    }

    return (
        <div className={styles.SearchShareContainer}>
            <button onClick={Close}>Close</button>
            <h1>Share</h1>
            <input ref={search} />
            <button onClick={Search} >Search</button>
            {datas.map(user => {
                return (
                    <div>
                        <h3>{user.username}</h3>
                        <button value={user.ID} onClick={Send} >Send</button>
                    </div>
                )
            })}
        </div>

    )
}