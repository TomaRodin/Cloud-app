import styles from '../../../styles/Styles.module.css'
import Cookie from 'universal-cookie'

export default function SharedFile(props) {

    function Download() {
        const cookie = new Cookie();
        window.location.replace(`http://localhost:3001/shared/download/${cookie.get('LoggedIn')}/${props.data.file}`)
    }

    return(
        <div className={styles.ShContainer}>
            <div className={styles.fileContainer}>
                <h3>{props.data.file}</h3>
                <p>Shared by: {props.data.sender}</p>
                <button onClick={Download}>Download</button>
            </div>
        </div>
    )
}